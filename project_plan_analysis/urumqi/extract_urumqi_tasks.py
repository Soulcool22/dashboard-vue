import csv
import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from collections import Counter
import matplotlib

# 设置中文字体
matplotlib.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'SimSun']
matplotlib.rcParams['axes.unicode_minus'] = False

def get_level(code):
    """获取编号的层级深度"""
    if not code or code.strip() == '':
        return 0
    return len(code.strip().split('.'))

def clean_name(name):
    """清理名称，去除前后空格"""
    return name.strip() if name else ''

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, '乌鲁木齐.csv')
    output_file = os.path.join(script_dir, '乌鲁木齐_dashboard_tasks.csv')
    chart_file = os.path.join(script_dir, '乌鲁木齐_completion_chart.png')
    
    # 读取所有数据
    rows = []
    
    with open(input_file, 'r', encoding='gbk') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        for row in reader:
            if len(row) >= 2:
                code = row[0].strip() if row[0] else ''
                name = clean_name(row[1])
                
                rows.append({
                    'code': code,
                    'name': name,
                    'predecessor': row[2].strip() if len(row) > 2 and row[2] else '',
                    'owner': row[3].strip() if len(row) > 3 and row[3] else '',
                    'executor': row[4].strip() if len(row) > 4 and row[4] else '',
                    'status': row[5].strip() if len(row) > 5 and row[5] else '',
                    'plan_start': row[6].strip() if len(row) > 6 and row[6] else '',
                    'plan_end': row[7].strip() if len(row) > 7 and row[7] else '',
                    'plan_duration': row[8].strip() if len(row) > 8 and row[8] else '',
                    'remark': row[9].strip() if len(row) > 9 and row[9] else '',
                    'actual_start': row[10].strip() if len(row) > 10 and row[10] else '',
                    'actual_end': row[11].strip() if len(row) > 11 and row[11] else '',
                    'actual_duration': row[12].strip() if len(row) > 12 and row[12] else '',
                })
    
    # 构建一级目录映射（用于标注父级）
    level1_map = {}  # code -> name
    level2_map = {}  # code -> name
    
    for r in rows:
        code = r['code']
        level = get_level(code)
        if level == 1:
            level1_map[code] = r['name']
        elif level == 2:
            level2_map[code] = r['name']
    
    # 选择合适颗粒度的任务
    result = []
    
    for r in rows:
        code = r['code']
        level = get_level(code)
        
        if not code:
            continue
        
        # 二级：里程碑
        if level == 2:
            task_type = '里程碑'
            # 找父级（一级）
            parent_code = code.split('.')[0]
            parent = level1_map.get(parent_code, '')
            task_name = r['name']
        # 三级：子任务
        elif level == 3:
            task_type = '子任务'
            # 找父级（二级）
            parent_code = '.'.join(code.split('.')[:2])
            parent = level2_map.get(parent_code, '')
            task_name = r['name']
        else:
            # 一级或更深层级跳过
            continue
        
        result.append({
            'parent': parent,
            'task_type': task_type,
            'task_code': code,
            'task_name': task_name,
            'owner': r['owner'],
            'executor': r['executor'],
            'status': r['status'],
            'plan_start': r['plan_start'],
            'plan_end': r['plan_end'],
            'plan_duration': r['plan_duration'],
            'remark': r['remark'],
            'actual_start': r['actual_start'],
            'actual_end': r['actual_end'],
            'actual_duration': r['actual_duration']
        })
    
    # 写入输出文件
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            '父级任务', '任务类型', '任务编号', '任务名称',
            '责任人', '执行人', '工作项状态', '计划开始时间', '计划完成时间', 
            '计划工期', '备注', '实际开始时间', '实际完成时间', '实际工期'
        ])
        for r in result:
            writer.writerow([
                r['parent'],
                r['task_type'],
                r['task_code'],
                r['task_name'],
                r['owner'],
                r['executor'],
                r['status'],
                r['plan_start'],
                r['plan_end'],
                r['plan_duration'],
                r['remark'],
                r['actual_start'],
                r['actual_end'],
                r['actual_duration']
            ])
    
    # 统计信息
    milestone_count = sum(1 for r in result if r['task_type'] == '里程碑')
    subtask_count = sum(1 for r in result if r['task_type'] == '子任务')
    
    print(f"清洗完成！共提取 {len(result)} 条任务记录")
    print(f"  里程碑: {milestone_count} 条")
    print(f"  子任务: {subtask_count} 条")
    print(f"输出文件: {output_file}")
    
    # ========== 生成对比折线图 ==========
    
    # 收集计划完成时间和实际完成时间
    milestone_plan_dates = []
    milestone_actual_dates = []
    subtask_plan_dates = []
    subtask_actual_dates = []
    
    for r in result:
        plan_end = r['plan_end']
        actual_end = r['actual_end']
        
        if r['task_type'] == '里程碑':
            if plan_end:
                try:
                    milestone_plan_dates.append(datetime.strptime(plan_end, '%Y-%m-%d'))
                except ValueError:
                    pass
            if actual_end:
                try:
                    milestone_actual_dates.append(datetime.strptime(actual_end, '%Y-%m-%d'))
                except ValueError:
                    pass
        else:  # 子任务
            if plan_end:
                try:
                    subtask_plan_dates.append(datetime.strptime(plan_end, '%Y-%m-%d'))
                except ValueError:
                    pass
            if actual_end:
                try:
                    subtask_actual_dates.append(datetime.strptime(actual_end, '%Y-%m-%d'))
                except ValueError:
                    pass
    
    # 计算累计完成数量
    def calc_cumulative(dates):
        if not dates:
            return [], []
        date_counts = Counter(dates)
        sorted_dates = sorted(date_counts.keys())
        cumulative = []
        total = 0
        for d in sorted_dates:
            total += date_counts[d]
            cumulative.append(total)
        return sorted_dates, cumulative
    
    m_plan_dates, m_plan_cum = calc_cumulative(milestone_plan_dates)
    m_actual_dates, m_actual_cum = calc_cumulative(milestone_actual_dates)
    s_plan_dates, s_plan_cum = calc_cumulative(subtask_plan_dates)
    s_actual_dates, s_actual_cum = calc_cumulative(subtask_actual_dates)
    
    # 创建图表 - 2行1列
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    
    # 图1: 里程碑对比
    if m_plan_dates:
        ax1.plot(m_plan_dates, m_plan_cum, marker='o', linewidth=2, markersize=6,
                 color='steelblue', label='计划完成', markerfacecolor='white', markeredgewidth=2)
    if m_actual_dates:
        ax1.plot(m_actual_dates, m_actual_cum, marker='s', linewidth=2, markersize=6,
                 color='coral', label='实际完成', markerfacecolor='white', markeredgewidth=2)
    
    ax1.set_xlabel('日期', fontsize=12)
    ax1.set_ylabel('累计完成数量', fontsize=12)
    ax1.set_title('里程碑：计划完成 vs 实际完成 累计对比图', fontsize=14, fontweight='bold')
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    ax1.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
    ax1.legend(loc='upper left')
    ax1.grid(True, alpha=0.3)
    
    # 图2: 子任务对比
    if s_plan_dates:
        ax2.plot(s_plan_dates, s_plan_cum, marker='o', linewidth=2, markersize=6,
                 color='steelblue', label='计划完成', markerfacecolor='white', markeredgewidth=2)
    if s_actual_dates:
        ax2.plot(s_actual_dates, s_actual_cum, marker='s', linewidth=2, markersize=6,
                 color='coral', label='实际完成', markerfacecolor='white', markeredgewidth=2)
    
    ax2.set_xlabel('日期', fontsize=12)
    ax2.set_ylabel('累计完成数量', fontsize=12)
    ax2.set_title('子任务：计划完成 vs 实际完成 累计对比图', fontsize=14, fontweight='bold')
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    ax2.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
    ax2.legend(loc='upper left')
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(chart_file, dpi=150, bbox_inches='tight')
    print(f"\n图表已保存: {chart_file}")
    
    # 打印统计信息
    print(f"\n=== 里程碑统计 ===")
    print(f"  有计划完成时间: {len(milestone_plan_dates)} 条")
    print(f"  有实际完成时间: {len(milestone_actual_dates)} 条")
    
    print(f"\n=== 子任务统计 ===")
    print(f"  有计划完成时间: {len(subtask_plan_dates)} 条")
    print(f"  有实际完成时间: {len(subtask_actual_dates)} 条")
    
    plt.show()

if __name__ == '__main__':
    main()
