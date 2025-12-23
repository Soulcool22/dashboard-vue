/**
 * 数据类型定义模块
 * 定义所有数据服务接口的类型和空数据结构工厂函数
 */

/**
 * 项目数据结构
 * @typedef {Object} Project
 * @property {string} id - 项目唯一标识
 * @property {string} name - 项目名称
 * @property {string} [sector] - 所属行业/部门
 * @property {boolean} isWatched - 是否关注
 * @property {number[]} series - 进度指数时间序列
 * @property {Object} [expandedMetrics] - 扩展指标
 * @property {number} [expandedMetrics.startOnTimeRate] - 按时开始率
 * @property {number} [expandedMetrics.startOnTimeRateDelta] - 按时开始率变化
 * @property {number} [expandedMetrics.completeOnTimeRate] - 按时完成率
 * @property {number} [expandedMetrics.completeOnTimeRateDelta] - 按时完成率变化
 * @property {number} [expandedMetrics.avgDurationRatio] - 平均工期比
 * @property {number} [expandedMetrics.avgDurationRatioDelta] - 平均工期比变化
 */

/**
 * KPI数据结构
 * @typedef {Object} KpiData
 * @property {string} title - KPI标题
 * @property {string} value - 显示值
 * @property {string} [delta] - 变化量
 * @property {boolean} [up] - 是否上升（正向变化）
 */

/**
 * 资金数据结构
 * @typedef {Object} FundData
 * @property {Object} totals - 汇总数据
 * @property {number} totals.totalDueAmount - 总应收金额
 * @property {number} totals.totalReceivedAmount - 已收金额
 * @property {number} totals.totalPendingAmount - 待收金额
 * @property {number} totals.arrivalRate - 到账率
 * @property {Array} fundStages - 款项节点列表
 * @property {Array} overdueItems - 逾期项目列表
 * @property {Object} stats - 统计数据
 * @property {number} stats.last - 最新值
 * @property {number|null} stats.prev - 上一期值
 * @property {number|null} stats.planLast - 计划值
 * @property {boolean} stats.isUp - 是否上升
 */

/**
 * 支出数据结构
 * @typedef {Object} ExpenditureData
 * @property {Object} totals - 汇总数据
 * @property {number} totals.totalBudget - 总预算
 * @property {number} totals.totalExpenditure - 总支出
 * @property {Object} monthlyTrend - 月度趋势
 * @property {string[]} monthlyTrend.xAxis - X轴标签
 * @property {number[]} monthlyTrend.personnel - 人员支出
 * @property {number[]} monthlyTrend.labor - 劳务支出
 * @property {number[]} monthlyTrend.other - 其他支出
 * @property {Array} topExpenditures - 重点支出列表
 */


/**
 * 人员数据结构
 * @typedef {Object} PersonnelData
 * @property {Array<PersonnelMember>} members - 成员列表
 */

/**
 * 人员成员结构
 * @typedef {Object} PersonnelMember
 * @property {string} id - 成员ID
 * @property {string} name - 成员姓名
 * @property {string} role - 角色
 * @property {number} projectCount - 参与项目数
 * @property {string[]} projects - 参与项目列表
 */

/**
 * 任务数据结构
 * @typedef {Object} TaskData
 * @property {string[]} xAxis - X轴日期标签
 * @property {number[]} actualRates - 实际完成率序列
 * @property {number[]} planRates - 计划完成率序列
 */

/**
 * 创建空的数据结构工厂函数
 * 用于在数据源为空或不可用时返回符合接口定义的空数据结构
 */
export const emptyStructures = {
  /**
   * 创建空的项目数据结构
   * @returns {Project}
   */
  project: () => ({
    id: '',
    name: '',
    sector: '',
    isWatched: false,
    series: [],
    expandedMetrics: null
  }),

  /**
   * 创建空的KPI数据结构
   * @returns {KpiData}
   */
  kpi: () => ({
    title: '',
    value: '0%',
    delta: '0%',
    up: true
  }),

  /**
   * 创建空的资金数据结构
   * @returns {FundData}
   */
  fundData: () => ({
    totals: {
      totalDueAmount: 0,
      totalReceivedAmount: 0,
      totalPendingAmount: 0,
      arrivalRate: 0
    },
    fundStages: [],
    overdueItems: [],
    stats: { last: 0, prev: null, planLast: null, isUp: true }
  }),

  /**
   * 创建空的支出数据结构
   * @returns {ExpenditureData}
   */
  expenditureData: () => ({
    totals: { totalBudget: 0, totalExpenditure: 0 },
    monthlyTrend: { xAxis: [], personnel: [], labor: [], other: [] },
    topExpenditures: []
  }),

  /**
   * 创建空的人员数据结构
   * @returns {PersonnelData}
   */
  personnelData: () => ({
    members: []
  }),

  /**
   * 创建空的任务数据结构
   * @returns {TaskData}
   */
  taskData: () => ({
    xAxis: [],
    actualRates: [],
    planRates: []
  })
}

/**
 * 验证项目数据结构是否符合接口定义
 * @param {any} data - 待验证的数据
 * @returns {boolean} - 是否符合接口定义
 */
export function isValidProject(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.id !== 'string') return false
  if (typeof data.name !== 'string') return false
  if (typeof data.isWatched !== 'boolean') return false
  if (!Array.isArray(data.series)) return false
  return true
}

/**
 * 验证KPI数据结构是否符合接口定义
 * @param {any} data - 待验证的数据
 * @returns {boolean} - 是否符合接口定义
 */
export function isValidKpiData(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.title !== 'string') return false
  if (typeof data.value !== 'string') return false
  return true
}

/**
 * 验证资金数据结构是否符合接口定义
 * @param {any} data - 待验证的数据
 * @returns {boolean} - 是否符合接口定义
 */
export function isValidFundData(data) {
  if (!data || typeof data !== 'object') return false
  if (!data.totals || typeof data.totals !== 'object') return false
  if (typeof data.totals.totalDueAmount !== 'number') return false
  if (typeof data.totals.totalReceivedAmount !== 'number') return false
  if (typeof data.totals.totalPendingAmount !== 'number') return false
  if (typeof data.totals.arrivalRate !== 'number') return false
  if (!Array.isArray(data.fundStages)) return false
  if (!Array.isArray(data.overdueItems)) return false
  if (!data.stats || typeof data.stats !== 'object') return false
  return true
}

/**
 * 验证支出数据结构是否符合接口定义
 * @param {any} data - 待验证的数据
 * @returns {boolean} - 是否符合接口定义
 */
export function isValidExpenditureData(data) {
  if (!data || typeof data !== 'object') return false
  if (!data.totals || typeof data.totals !== 'object') return false
  if (typeof data.totals.totalBudget !== 'number') return false
  if (typeof data.totals.totalExpenditure !== 'number') return false
  if (!data.monthlyTrend || typeof data.monthlyTrend !== 'object') return false
  if (!Array.isArray(data.monthlyTrend.xAxis)) return false
  if (!Array.isArray(data.monthlyTrend.personnel)) return false
  if (!Array.isArray(data.monthlyTrend.labor)) return false
  if (!Array.isArray(data.monthlyTrend.other)) return false
  if (!Array.isArray(data.topExpenditures)) return false
  return true
}

/**
 * 验证人员数据结构是否符合接口定义
 * @param {any} data - 待验证的数据
 * @returns {boolean} - 是否符合接口定义
 */
export function isValidPersonnelData(data) {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.members)) return false
  return true
}

/**
 * 验证任务数据结构是否符合接口定义
 * @param {any} data - 待验证的数据
 * @returns {boolean} - 是否符合接口定义
 */
export function isValidTaskData(data) {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.xAxis)) return false
  if (!Array.isArray(data.actualRates)) return false
  if (!Array.isArray(data.planRates)) return false
  return true
}
