// src/config/index.js
// 配置管理器 - 集中管理所有可配置项

export const dashboardConfig = {
  // 区域配置
  regions: [
    { id: 'all', name: '全国', isDefault: true },
    { id: 'east', name: '华东' },
    { id: 'south', name: '华南' },
    { id: 'north', name: '华北' },
    { id: 'west', name: '西部' }
  ],
  
  // KPI配置
  kpis: [
    {
      id: 'fund_arrival',
      title: '资金到账率',
      compareMode: null,  // null表示不显示变化量
      showDelta: false,
      viewComponent: 'FundArrivalView'
    },
    {
      id: 'task_completion',
      title: '任务完成率',
      compareMode: 'plan',  // 'plan' | 'period' | null
      showDelta: true,
      viewComponent: 'TaskCompletionView'
    },
    {
      id: 'milestone',
      title: '关键里程碑达成率',
      compareMode: 'plan',
      showDelta: true,
      viewComponent: 'TaskCompletionView'
    },
    {
      id: 'overdue_task',
      title: '逾期任务数',
      compareMode: 'period',
      showDelta: true,
      viewComponent: 'OverdueTaskView'
    },
    {
      id: 'project_expenditure',
      title: '项目支出金额',
      compareMode: null,
      showDelta: false,
      viewComponent: 'ProjectExpenditureView'
    },
    {
      id: 'personnel_health',
      title: '人员健康度',
      compareMode: null,
      showDelta: false,
      viewComponent: 'PersonnelHealthView'
    }
  ],
  
  // 阈值配置
  thresholds: {
    personnelRisk: {
      projectCountLimit: 3,  // 挂名项目超过此数量判定为风险
      healthyScore: 80,      // 健康度分数阈值
      warningScore: 60
    },
    projectRisk: {
      highRiskOverdueRate: 0.3,
      mediumRiskOverdueRate: 0.15
    }
  },
  
  // 显示配置
  display: {
    defaultKpi: '任务完成率',
    chartHeight: 250,
    listPageSize: 10
  }
}

/**
 * 根据KPI标题获取KPI配置
 * @param {string} kpiTitle - KPI标题
 * @returns {Object|undefined} KPI配置对象
 */
export function getKpiConfig(kpiTitle) {
  return dashboardConfig.kpis.find(k => k.title === kpiTitle)
}

/**
 * 获取所有区域列表
 * @returns {Array} 区域列表
 */
export function getRegions() {
  return dashboardConfig.regions
}

/**
 * 获取指定类别的阈值配置
 * @param {string} category - 阈值类别
 * @param {string} key - 阈值键名
 * @returns {*} 阈值值
 */
export function getThreshold(category, key) {
  return dashboardConfig.thresholds[category]?.[key]
}
