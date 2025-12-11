import csv
from collections import defaultdict

"""
项目看板任务结构设计：
- 阶段(Phase): 启动阶段、准备阶段、实施阶段
- 里程碑(Milestone): 项目启动、交付准备、深化设计、采购准备、劳务准备、软件开发、现场施工
- 任务(Task): 工程类型级别的任务（电气工程、空调工程、海关监管设施设备工程等）
- 子系统(Subsystem): 具体子系统（卫生检疫及行李查验、入境托运行李先期机检系统等）

颗粒度说明：
- 不要太细（具体物料如"配线WDZB1-BYJ-25 150.81 m"）
- 不要太粗（只有"准备阶段"）
- 选择工程类型和子系统级别，适合项目看板跟踪
"""

def get_level(code):
    """获取编号的层级深度"""
    if not code or code.strip() == '' or code.strip() == 's':
        return 0
    return len(code.strip().split('.'))

def clean_name(name):
    """清理名称，去除前后空格"""
    return name.strip() if name else ''

def main():
    input_file = r'2025CJ0701重庆江北国际机场T3B 航站楼及第四跑道工程T3A 航站楼联检设施改造工程_项目计划_v2.0_20251211_100108.csv'
    output_file = r'dashboard_tasks.csv'
    
    # 阶段定义
    phases = {
        '启动阶段': ['1'],
        '准备阶段': ['2', '3', '4', '5'],
        '实施阶段': ['6', '7']
    }
    
    # 里程碑定义（一级编号）
    milestones = {
        '1': '项目启动',
        '2': '交付准备',
        '3': '深化设计',
        '4': '采购准备',
        '5': '劳务准备',
        '6': '软件开发',
        '7': '现场施工及安装调试'
    }
    
    # 读取所有数据
    rows = []
    current_phase = None
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        for row in reader:
            if len(row) >= 2:
                code = row[0].strip() if row[0] else ''
                name = clean_name(row[1])
                
                # 检测阶段标记（无编号的行）
                if not code and name in ['启动阶段', '准备阶段', '实施阶段']:
                    current_phase = name
                    continue
                
                # 跳过项目收款
                if not code and name == '项目收款':
                    current_phase = '项目收款'
                    continue
                if code.startswith('0'):
                    continue
                if current_phase == '项目收款':
                    if code.startswith('0') or not code:
                        continue
                
                rows.append({
                    'code': code,
                    'name': name,
                    'phase': current_phase,
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
    
    # 选择合适颗粒度的任务
    # 策略：选择2-3级的任务作为看板任务，同时标明其父级
    result = []
    
    for r in rows:
        code = r['code']
        level = get_level(code)
        
        if not code:
            continue
            
        # 确定阶段
        first_digit = code.split('.')[0]
        phase = None
        for p, codes in phases.items():
            if first_digit in codes:
                phase = p
                break
        
        if not phase:
            continue
        
        # 确定里程碑
        milestone = milestones.get(first_digit, '')
        
        # 选择合适的颗粒度
        # 一级(1,2,3...)：里程碑级别
        # 二级(1.1, 2.1, 3.1...)：主要任务
        # 三级(1.1.1, 2.1.1...)：子任务（工程类型）
        # 四级(7.1.3.1...)：子系统（关键子系统，仅针对实施阶段的施工任务）
        
        if level == 1:
            # 里程碑级别
            task_type = '里程碑'
            parent = phase
            task_name = r['name']
        elif level == 2:
            # 主要任务
            task_type = '主要任务'
            parent = milestones.get(first_digit, '')
            task_name = r['name']
        elif level == 3:
            # 子任务（工程类型或具体工作包）
            task_type = '子任务'
            # 找父级名称
            parent_code = '.'.join(code.split('.')[:2])
            parent = ''
            for pr in rows:
                if pr['code'] == parent_code:
                    parent = pr['name']
                    break
            task_name = r['name']
        elif level == 4 and first_digit in ['6', '7']:
            # 四级：仅针对实施阶段的关键子系统
            # 排除物料级别的任务（电气工程、空调工程下的具体物料）
            # 只保留有意义的子系统（如：卫生检疫及行李查验、视频监控系统等）
            parent_code = '.'.join(code.split('.')[:3])
            parent = ''
            for pr in rows:
                if pr['code'] == parent_code:
                    parent = pr['name']
                    break
            
            # 判断是否为有意义的子系统（非物料级别）
            # 电气工程(7.1.1)、空调工程(7.1.2)下的四级是物料，跳过
            # 海关监管设施设备工程(7.1.3)、边检设施设备工程(7.1.4)等下的四级是子系统
            third_level_code = '.'.join(code.split('.')[:3])
            if third_level_code in ['7.1.1', '7.1.2']:  # 电气、空调的四级是物料，跳过
                continue
            
            task_type = '子系统'
            task_name = r['name']
        else:
            # 太细的颗粒度跳过
            continue
        
        result.append({
            'phase': phase,
            'milestone': milestone,
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
            '阶段', '里程碑', '父级任务', '任务类型', '任务编号', '任务名称',
            '责任人', '执行人', '工作项状态', '计划开始时间', '计划完成时间', 
            '计划工期', '备注', '实际开始时间', '实际完成时间', '实际工期'
        ])
        for r in result:
            writer.writerow([
                r['phase'],
                r['milestone'],
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
    phase_counts = defaultdict(int)
    type_counts = defaultdict(int)
    for r in result:
        phase_counts[r['phase']] += 1
        type_counts[r['task_type']] += 1
    
    print(f"清洗完成！共提取 {len(result)} 条任务记录")
    print(f"输出文件: {output_file}")
    print(f"\n=== 按阶段统计 ===")
    for phase, count in phase_counts.items():
        print(f"  {phase}: {count} 条")
    print(f"\n=== 按任务类型统计 ===")
    for task_type, count in type_counts.items():
        print(f"  {task_type}: {count} 条")
    
    print(f"\n=== 示例数据（前15条）===")
    for i, r in enumerate(result[:15]):
        print(f"{i+1}. [{r['phase']}] {r['milestone']} > {r['parent']} > {r['task_name'][:30]}...")

if __name__ == '__main__':
    main()
