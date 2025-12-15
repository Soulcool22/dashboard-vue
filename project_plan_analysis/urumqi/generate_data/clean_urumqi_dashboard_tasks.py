import csv
import os
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

DATE_FMT = "%Y-%m-%d"
ON_TIME_COMPLETED = {"已完成"}
OVERDUE_COMPLETED = {"逾期完成"}
COMPLETED_STATUSES = ON_TIME_COMPLETED | OVERDUE_COMPLETED
IN_PROGRESS_STATUSES = {"进行中", "逾期"}
NOT_STARTED_STATUSES = {"未开始"}


def parse_date(value: str) -> Optional[datetime]:
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    try:
        return datetime.strptime(value, DATE_FMT)
    except ValueError:
        return None


def format_date(value: Optional[datetime]) -> str:
    return value.strftime(DATE_FMT) if value else ""


def parse_int(value: str) -> Optional[int]:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    try:
        return int(value)
    except ValueError:
        return None


def compute_duration(start: Optional[datetime], end: Optional[datetime]) -> Optional[int]:
    if not start or not end:
        return None
    return (end.date() - start.date()).days + 1


def harmonize_period(record: Dict, prefix: str) -> None:
    start_key = f"{prefix}_start"
    end_key = f"{prefix}_end"
    duration_key = f"{prefix}_duration"

    start = record.get(start_key)
    end = record.get(end_key)
    duration = record.get(duration_key)

    if start and end:
        record[duration_key] = compute_duration(start, end)
    elif start and duration:
        record[end_key] = start + timedelta(days=duration - 1)
    elif end and duration:
        record[start_key] = end - timedelta(days=duration - 1)


def load_dashboard_tasks(path: str) -> List[Dict]:
    tasks: List[Dict] = []
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            code = (row.get("任务编号") or "").strip()
            if not code:
                continue
            plan_start_str = (row.get("计划开始时间") or "").strip()
            plan_end_str = (row.get("计划完成时间") or "").strip()
            actual_start_str = (row.get("实际开始时间") or "").strip()
            actual_end_str = (row.get("实际完成时间") or "").strip()
            task = {
                "index": idx,
                "parent_name": (row.get("父级任务") or "").strip(),
                "task_type": (row.get("任务类型") or "").strip(),
                "task_code": code,
                "task_name": (row.get("任务名称") or "").strip(),
                "owner": (row.get("责任人") or "").strip(),
                "executor": (row.get("执行人") or "").strip(),
                "status": (row.get("工作项状态") or "").strip() or "未开始",
                "plan_start": parse_date(plan_start_str),
                "plan_end": parse_date(plan_end_str),
                "plan_duration": parse_int(row.get("计划工期") or ""),
                "remark": (row.get("备注") or "").strip(),
                "actual_start": parse_date(actual_start_str),
                "actual_end": parse_date(actual_end_str),
                "actual_duration": parse_int(row.get("实际工期") or ""),
                "children": [],
                "parent_index": None,
                "level": len(code.split(".")),
                "initial_missing": {
                    "plan_start": not plan_start_str,
                    "plan_end": not plan_end_str,
                    "plan_duration": not (row.get("计划工期") or "").strip(),
                    "actual_start": not actual_start_str,
                    "actual_end": not actual_end_str,
                    "actual_duration": not (row.get("实际工期") or "").strip(),
                },
            }
            harmonize_period(task, "plan")
            harmonize_period(task, "actual")
            tasks.append(task)
    return tasks


def load_raw_entries(path: str) -> (List[Dict], Dict[str, List[Dict]]):
    entries: List[Dict] = []
    code_map: Dict[str, List[Dict]] = defaultdict(list)
    with open(path, "r", encoding="gbk", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = (row.get("序号") or "").strip()
            if not code or code.lower() == "s":
                continue
            entry = {
                "code": code,
                "name": (row.get("工作项名称") or "").strip(),
                "plan_start": parse_date((row.get("计划开始时间") or "").strip()),
                "plan_end": parse_date((row.get("计划完成时间") or "").strip()),
                "plan_duration": parse_int(row.get("计划工期") or ""),
                "actual_start": parse_date((row.get("实际开始时间") or "").strip()),
                "actual_end": parse_date((row.get("实际完成时间") or "").strip()),
                "actual_duration": parse_int(row.get("实际工期") or ""),
            }
            harmonize_period(entry, "plan")
            harmonize_period(entry, "actual")
            entries.append(entry)
            code_map[code].append(entry)
    return entries, code_map


def get_raw_match(task: Dict, raw_code_map: Dict[str, List[Dict]]) -> Optional[Dict]:
    candidates = raw_code_map.get(task["task_code"], [])
    if not candidates:
        return None
    for entry in candidates:
        if entry["name"] == task["task_name"]:
            return entry
    return candidates[0]


def fill_from_raw_entry(task: Dict, raw_code_map: Dict[str, List[Dict]]) -> None:
    entry = get_raw_match(task, raw_code_map)
    if not entry:
        return
    for field in ["plan_start", "plan_end", "plan_duration", "actual_start", "actual_end", "actual_duration"]:
        if task.get(field) is None and entry.get(field) is not None:
            task[field] = entry[field]


def get_descendants(code: str, raw_entries: List[Dict], cache: Dict[str, List[Dict]]) -> List[Dict]:
    if code in cache:
        return cache[code]
    prefix = f"{code}."
    cache[code] = [entry for entry in raw_entries if entry["code"].startswith(prefix)]
    return cache[code]


def fill_from_raw_descendants(task: Dict, raw_entries: List[Dict], cache: Dict[str, List[Dict]]) -> None:
    descendants = get_descendants(task["task_code"], raw_entries, cache)
    if not descendants:
        return

    if task.get("plan_start") is None:
        candidates = [d["plan_start"] for d in descendants if d["plan_start"]]
        if candidates:
            task["plan_start"] = min(candidates)
    if task.get("plan_end") is None:
        candidates = [d["plan_end"] for d in descendants if d["plan_end"]]
        if candidates:
            task["plan_end"] = max(candidates)

    if task.get("actual_start") is None:
        candidates = [d["actual_start"] for d in descendants if d["actual_start"]]
        if candidates:
            task["actual_start"] = min(candidates)
    if task.get("actual_end") is None:
        candidates = [d["actual_end"] for d in descendants if d["actual_end"]]
        if candidates:
            task["actual_end"] = max(candidates)


def attach_parent_child(tasks: List[Dict]) -> None:
    code_map: Dict[str, List[int]] = defaultdict(list)
    for idx, task in enumerate(tasks):
        code_map[task["task_code"]].append(idx)

    for idx, task in enumerate(tasks):
        code = task["task_code"]
        if "." not in code:
            continue
        parent_code = ".".join(code.split(".")[:-1])
        parent_idx = None
        candidates = code_map.get(parent_code, [])
        if len(candidates) == 1:
            parent_idx = candidates[0]
        elif len(candidates) > 1:
            for cand in candidates:
                if tasks[cand]["task_name"] == task["parent_name"]:
                    parent_idx = cand
                    break
            if parent_idx is None:
                parent_idx = candidates[0]
        if parent_idx is not None:
            task["parent_index"] = parent_idx
            tasks[parent_idx]["children"].append(idx)
            task["parent_name"] = tasks[parent_idx]["task_name"]


def update_parent_bounds(tasks: List[Dict]) -> None:
    for task in sorted(tasks, key=lambda t: t["level"], reverse=True):
        children = [tasks[idx] for idx in task["children"]]
        if not children:
            continue
        plan_starts = [c["plan_start"] for c in children if c["plan_start"]]
        plan_ends = [c["plan_end"] for c in children if c["plan_end"]]
        if plan_starts:
            min_start = min(plan_starts)
            if task["plan_start"] is None or min_start < task["plan_start"]:
                task["plan_start"] = min_start
        if plan_ends:
            max_end = max(plan_ends)
            if task["plan_end"] is None or max_end > task["plan_end"]:
                task["plan_end"] = max_end

        if task["status"] in COMPLETED_STATUSES:
            actual_starts = [c["actual_start"] for c in children if c["actual_start"]]
            actual_ends = [c["actual_end"] for c in children if c["actual_end"]]
            if actual_starts:
                min_actual_start = min(actual_starts)
                if task["actual_start"] is None or min_actual_start < task["actual_start"]:
                    task["actual_start"] = min_actual_start
            if actual_ends:
                max_actual_end = max(actual_ends)
                if task["actual_end"] is None or max_actual_end > task["actual_end"]:
                    task["actual_end"] = max_actual_end


def enforce_child_within_parent(tasks: List[Dict]) -> None:
    for task in sorted(tasks, key=lambda t: t["level"]):
        parent_idx = task.get("parent_index")
        if parent_idx is None:
            continue
        parent = tasks[parent_idx]
        if parent["plan_start"]:
            if task["plan_start"] is None:
                task["plan_start"] = parent["plan_start"]
            else:
                task["plan_start"] = max(task["plan_start"], parent["plan_start"])
        if parent["plan_end"]:
            if task["plan_end"] is None:
                task["plan_end"] = parent["plan_end"]
            else:
                task["plan_end"] = min(task["plan_end"], parent["plan_end"])


def enforce_status_rules(tasks: List[Dict]) -> None:
    for task in tasks:
        children = [tasks[idx] for idx in task["children"]]
        status = task["status"]

        def first_child_actual_start() -> Optional[datetime]:
            starts = [c["actual_start"] for c in children if c["actual_start"]]
            return min(starts) if starts else None

        def last_child_actual_end() -> Optional[datetime]:
            ends = [c["actual_end"] for c in children if c["actual_end"]]
            return max(ends) if ends else None

        if status in COMPLETED_STATUSES:
            if task["actual_start"] is None:
                task["actual_start"] = first_child_actual_start() or task["plan_start"]
            if task["actual_end"] is None:
                task["actual_end"] = last_child_actual_end() or task["plan_end"]
            if task["plan_end"] and task["actual_end"]:
                if status in ON_TIME_COMPLETED and task["actual_end"] > task["plan_end"]:
                    task["actual_end"] = task["plan_end"]
                if status in OVERDUE_COMPLETED and task["actual_end"] <= task["plan_end"]:
                    task["actual_end"] = task["plan_end"] + timedelta(days=1)
        elif status in IN_PROGRESS_STATUSES:
            if task["actual_start"] is None:
                task["actual_start"] = first_child_actual_start() or task["plan_start"]
            task["actual_end"] = None
        elif status in NOT_STARTED_STATUSES:
            task["actual_start"] = None
            task["actual_end"] = None


def write_csv(tasks: List[Dict], output_path: str) -> None:
    header = [
        "父级任务",
        "任务类型",
        "任务编号",
        "任务名称",
        "责任人",
        "执行人",
        "工作项状态",
        "计划开始时间",
        "计划完成时间",
        "计划工期",
        "备注",
        "实际开始时间",
        "实际完成时间",
        "实际工期",
    ]
    with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for task in tasks:
            writer.writerow(
                [
                    task["parent_name"],
                    task["task_type"],
                    task["task_code"],
                    task["task_name"],
                    task["owner"],
                    task["executor"],
                    task["status"],
                    format_date(task["plan_start"]),
                    format_date(task["plan_end"]),
                    task["plan_duration"] or "",
                    task["remark"],
                    format_date(task["actual_start"]),
                    format_date(task["actual_end"]),
                    task["actual_duration"] or "",
                ]
            )


def write_summary(tasks: List[Dict], summary_path: str) -> None:
    status_counter = Counter(task["status"] for task in tasks)
    plan_starts = [task["plan_start"] for task in tasks if task["plan_start"]]
    plan_ends = [task["plan_end"] for task in tasks if task["plan_end"]]

    fill_fields = [
        ("plan_start", "计划开始时间"),
        ("plan_end", "计划完成时间"),
        ("plan_duration", "计划工期"),
        ("actual_start", "实际开始时间"),
        ("actual_end", "实际完成时间"),
        ("actual_duration", "实际工期"),
    ]

    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(f"任务总数: {len(tasks)}\n\n")
        f.write("状态分布:\n")
        for status, count in status_counter.items():
            f.write(f"  - {status or '未标注'}: {count}\n")
        f.write("\n")

        if plan_starts and plan_ends:
            f.write(
                f"整体计划区间: {format_date(min(plan_starts))} 至 {format_date(max(plan_ends))}\n\n"
            )

        f.write("字段填充情况:\n")
        for field, label in fill_fields:
            newly_filled = sum(
                1
                for task in tasks
                if task.get(field) and task["initial_missing"].get(field, False)
            )
            still_missing = sum(1 for task in tasks if not task.get(field))
            f.write(
                f"  - {label}: 新填充 {newly_filled} 条，仍缺失 {still_missing} 条\n"
            )


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_csv = os.path.normpath(os.path.join(base_dir, "..", "乌鲁木齐_dashboard_tasks.csv"))
    raw_csv = os.path.normpath(os.path.join(base_dir, "..", "乌鲁木齐.csv"))
    output_csv = os.path.join(base_dir, "乌鲁木齐_dashboard_tasks_cleaned_v2.csv")
    summary_path = os.path.join(base_dir, "乌鲁木齐_dashboard_tasks_summary_v2.txt")

    tasks = load_dashboard_tasks(input_csv)
    raw_entries, raw_code_map = load_raw_entries(raw_csv)
    descendants_cache: Dict[str, List[Dict]] = {}

    for task in tasks:
        fill_from_raw_entry(task, raw_code_map)
        fill_from_raw_descendants(task, raw_entries, descendants_cache)

    attach_parent_child(tasks)
    update_parent_bounds(tasks)
    enforce_child_within_parent(tasks)
    enforce_status_rules(tasks)

    for task in tasks:
        harmonize_period(task, "plan")
        harmonize_period(task, "actual")

    write_csv(tasks, output_csv)
    write_summary(tasks, summary_path)
    print(f"清洗完成，输出: {output_csv}")
    print(f"摘要: {summary_path}")


if __name__ == "__main__":
    main()
