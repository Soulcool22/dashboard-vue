import csv
import re
from collections import defaultdict

def get_level(code):
    """获取编号的层级深度（点数+1）"""
    if not code or code.strip() == '' or code.strip() == 's':
        return 0
    return len(code.strip().split('.'))

def is_child_of(child_code, parent_code):
    """判断child_code是否是parent_code的子节点"""
    if not child_code or not parent_code:
        return False
    return child_code.startswith(parent_code + '.')

def clean_name(name):
    """清理名称，去除前后空格"""
    return name.strip() if name else ''

def main():
    input_file = r'2025CJ0701重庆江北国际机场T3B 航站楼及第四跑道工程T3A 航站楼联检设施改造工程_项目计划_v2.0_20251211_100108.csv'
    output_file = r'cleaned_milestones_tasks.csv'
    
    # 读取所有数据
    rows = []
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # 跳过表头
        # 表头: s,工作项名称,前置工作项,责任人,执行人,工作项状态,计划开始时间,计划完成时间,计划工期,备注,实际开始时间,实际完成时间,实际工期
        for row in reader:
            if len(row) >= 2:
                code = row[0].strip() if row[0] else ''
                name = row[1].strip() if row[1] else ''
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
                    'full_row': row
                })
    
    # 构建所有编号集合，用于判断是否有子节点
    all_codes = set(r['code'] for r in rows if r['code'])
    
    # 判断一个节点是否是叶子节点（没有子节点）
    def is_leaf(code):
        if not code:
            return False
        for c in all_codes:
            if c != code and c.startswith(code + '.'):
                return False
        return True
    
    # 找出所有四级目录（里程碑）- 编号有3个点，如 3.4.1.1
    milestones = []
    for r in rows:
        code = r['code']
        name = r['name']
        level = get_level(code)
        
        # 跳过项目收款相关（以0开头的编号）
        if code and code.startswith('0'):
            continue
        
        # 四级目录：层级为4（有3个点）
        if level == 4:
            milestones.append({
                'code': code,
                'name': name
            })
    
    # 为每个里程碑找到其下的所有叶子节点（最细任务）
    result = []
    for milestone in milestones:
        m_code = milestone['code']
        m_name = milestone['name']
        
        # 找到该里程碑下的所有叶子节点
        tasks = []
        for r in rows:
            code = r['code']
            
            # 必须是该里程碑的子节点
            if is_child_of(code, m_code):
                # 必须是叶子节点
                if is_leaf(code):
                    tasks.append(r)  # 保留完整行数据
        
        # 如果里程碑本身就是叶子节点，也要加入
        if is_leaf(m_code) and not tasks:
            # 找到里程碑自身的完整数据
            for r in rows:
                if r['code'] == m_code:
                    tasks.append(r)
                    break
        
        for task in tasks:
            result.append({
                'milestone_code': m_code,
                'milestone_name': m_name,
                'task_code': task['code'],
                'task_name': task['name'],
                'owner': task['owner'],
                'executor': task['executor'],
                'status': task['status'],
                'plan_start': task['plan_start'],
                'plan_end': task['plan_end'],
                'plan_duration': task['plan_duration'],
                'remark': task['remark'],
                'actual_start': task['actual_start'],
                'actual_end': task['actual_end'],
                'actual_duration': task['actual_duration']
            })
    
    # 写入输出文件
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['里程碑编号', '里程碑名称', '任务编号', '任务名称', '责任人', '执行人', '工作项状态', '计划开始时间', '计划完成时间', '计划工期', '备注', '实际开始时间', '实际完成时间', '实际工期'])
        for r in result:
            writer.writerow([
                r['milestone_code'],
                r['milestone_name'],
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
    
    print(f"清洗完成！共提取 {len(milestones)} 个里程碑，{len(result)} 条任务记录")
    print(f"输出文件: {output_file}")
    
    # 打印前20条示例
    print("\n=== 前20条示例 ===")
    for i, r in enumerate(result[:20]):
        print(f"{i+1}. 里程碑: {r['milestone_name'][:30]}... | 任务: {r['task_name'][:40]}...")

if __name__ == '__main__':
    main()
