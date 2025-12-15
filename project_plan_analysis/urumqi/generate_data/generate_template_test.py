"""
从已清洗的乌鲁木齐数据生成template_test.csv
只保留最细颗粒度任务（子任务），排除里程碑
"""
import csv
import os
from typing import Dict, List, Optional


def get_parent_code(code: str) -> Optional[str]:
    """获取父级任务编号"""
    if "." not in code:
        return None
    return ".".join(code.split(".")[:-1])


def load_cleaned_data(path: str) -> List[Dict]:
    """加载已清洗的CSV数据"""
    entries: List[Dict] = []
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            task_type = (row.get("任务类型") or "").strip()
            # 只保留子任务，排除里程碑
            if task_type == "里程碑":
                continue
            
            code = (row.get("任务编号") or "").strip()
            if not code:
                continue
            
            entry = {
                "parent_name": (row.get("父级任务") or "").strip(),
                "task_type": task_type,
                "code": code,
                "name": (row.get("任务名称") or "").strip(),
                "owner": (row.get("责任人") or "").strip(),
                "executor": (row.get("执行人") or "").strip(),
                "status": (row.get("工作项状态") or "").strip() or "未开始",
                "plan_start": (row.get("计划开始时间") or "").strip(),
                "plan_end": (row.get("计划完成时间") or "").strip(),
                "plan_duration": (row.get("计划工期") or "").strip(),
                "actual_start": (row.get("实际开始时间") or "").strip(),
                "actual_end": (row.get("实际完成时间") or "").strip(),
                "actual_duration": (row.get("实际工期") or "").strip(),
                "remark": (row.get("备注") or "").strip(),
            }
            entries.append(entry)
    return entries


def get_stage(parent_name: str, code: str) -> str:
    """根据父级任务名称或任务编号获取阶段"""
    top_level = code.split(".")[0]
    if top_level == "1":
        return "实施阶段"
    elif top_level == "2":
        return "预验收整改问题汇总"
    return ""


def write_template_csv(tasks: List[Dict], output_path: str) -> None:
    """按照模板格式写入CSV"""
    header = [
        "项目名称",
        "阶段",
        "序号",
        "项目ID",
        "工作项名称",
        "工作项ID",
        "父级工作项",
        "责任人",
        "执行人",
        "工作项状态",
        "计划开始时间",
        "计划完成时间",
        "计划工期",
        "实际开始时间",
        "实际完成时间",
        "实际工期",
        "备注",
    ]
    
    with open(output_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        
        for idx, task in enumerate(tasks, start=1):
            parent_code = get_parent_code(task["code"])
            stage = get_stage(task["parent_name"], task["code"])
            
            writer.writerow([
                "乌鲁木齐",                    # 项目名称
                stage,                         # 阶段
                idx,                           # 序号（重新编号）
                "",                            # 项目ID（无需填写）
                task["name"],                  # 工作项名称
                task["code"],                  # 工作项ID（使用原任务编号）
                task["parent_name"],          # 父级工作项（名称）
                task["owner"],                 # 责任人
                task["executor"],              # 执行人
                task["status"],                # 工作项状态
                task["plan_start"],            # 计划开始时间
                task["plan_end"],              # 计划完成时间
                task["plan_duration"],         # 计划工期
                task["actual_start"],          # 实际开始时间
                task["actual_end"],            # 实际完成时间
                task["actual_duration"],       # 实际工期
                task["remark"],                # 备注
            ])


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 输入文件：已清洗的乌鲁木齐数据
    input_csv = os.path.normpath(os.path.join(base_dir, "..", "..", "..", "test_data", "乌鲁木齐_dashboard_tasks_cleaned_v2.csv"))
    
    # 输出文件：test_data/template_test.csv
    output_csv = os.path.normpath(os.path.join(base_dir, "..", "..", "..", "test_data", "template_test.csv"))
    
    print(f"读取源文件: {input_csv}")
    
    # 加载数据（已自动排除里程碑）
    tasks = load_cleaned_data(input_csv)
    print(f"子任务数（排除里程碑）: {len(tasks)}")
    
    # 写入输出文件
    write_template_csv(tasks, output_csv)
    print(f"输出文件: {output_csv}")
    print("处理完成！")


if __name__ == "__main__":
    main()
