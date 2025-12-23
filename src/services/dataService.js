/**
 * 数据服务层
 * 使用适配器模式，支持数据源配置切换
 * 当数据源为空或不可用时返回符合接口定义的空数据结构
 */

import { emptyStructures } from './dataTypes'
import { dashboardConfig } from '../config'

// ============================================================================
// 数据适配器管理
// ============================================================================

/**
 * 当前数据适配器实例
 * @type {Object|null}
 */
let dataAdapter = null

/**
 * 设置数据适配器
 * @param {Object} adapter - 数据适配器实现，需实现以下方法：
 *   - getProjects(): Promise<Project[]>
 *   - getKpis(projectId): Promise<KpiData[]>
 *   - getFundData(projectId): Promise<FundData>
 *   - getExpenditureData(projectId): Promise<ExpenditureData>
 *   - getPersonnelData(projectId): Promise<PersonnelData>
 *   - getTaskData(projectId, kpi): Promise<TaskData>
 *   - getRiskProjects(region): Promise<RiskProject[]>
 *   - getCompanyInsights(): Promise<CompanyInsights>
 *   - getRegionalData(region): Promise<RegionalData>
 *   - getProjectUpdates(): Promise<ProjectUpdate[]>
 *   - getWorkOrders(): Promise<WorkOrder[]>
 *   - getAttributionData(kpi): Promise<AttributionData>
 *   - getProjectSeries(projectId): Promise<number[]>
 */
export function setDataAdapter(adapter) {
  dataAdapter = adapter
}

/**
 * 获取当前数据适配器
 * @returns {Object|null} 当前适配器实例
 */
export function getDataAdapter() {
  return dataAdapter
}

/**
 * 清除数据适配器
 */
export function clearDataAdapter() {
  dataAdapter = null
}

// ============================================================================
// 错误处理辅助函数
// ============================================================================

/**
 * 安全执行适配器方法
 * @param {string} methodName - 方法名
 * @param {Function} fallback - 失败时的回退函数
 * @param {...any} args - 传递给适配器方法的参数
 * @returns {Promise<any>} 执行结果
 */
async function safeAdapterCall(methodName, fallback, ...args) {
  if (!dataAdapter || typeof dataAdapter[methodName] !== 'function') {
    console.warn(`[dataService] No adapter configured for ${methodName}`)
    return fallback()
  }
  
  try {
    // 使用 .call() 确保 this 上下文正确绑定到 dataAdapter
    return await dataAdapter[methodName].call(dataAdapter, ...args)
  } catch (e) {
    console.error(`[dataService] ${methodName} failed:`, e)
    return fallback()
  }
}

// ============================================================================
// 数据获取接口
// ============================================================================

/**
 * 获取项目列表
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
  return safeAdapterCall('getProjects', () => [])
}

/**
 * 获取KPI数据
 * @param {string} projectId - 项目ID
 * @returns {Promise<KpiData[]>}
 */
export async function getKpis(projectId) {
  const fallback = () => dashboardConfig.kpis.map(kpi => ({
    ...emptyStructures.kpi(),
    title: kpi.title
  }))
  
  return safeAdapterCall('getKpis', fallback, projectId)
}

/**
 * 获取风险项目列表
 * @param {string} region - 区域
 * @returns {Promise<RiskProject[]>}
 */
export async function getRiskProjects(region) {
  return safeAdapterCall('getRiskProjects', () => [], region)
}

/**
 * 获取项目时间序列数据
 * @param {string} projectId - 项目ID
 * @returns {Promise<number[]>}
 */
export async function getProjectSeries(projectId) {
  return safeAdapterCall('getProjectSeries', () => [], projectId)
}

/**
 * 获取公司洞察数据
 * @returns {Promise<CompanyInsights>}
 */
export async function getCompanyInsights() {
  const fallback = () => ({
    summaryText: '',
    metrics: {
      healthIndex: 0,
      healthLabel: '',
      personnelHealth: 0,
      fundReturnRatio: 0,
      deliveryEfficiencyLabel: ''
    },
    trend: {
      xAxis: [],
      plan: [],
      actual: []
    }
  })
  
  return safeAdapterCall('getCompanyInsights', fallback)
}

/**
 * 获取区域数据
 * @param {string} region - 区域
 * @returns {Promise<RegionalData>}
 */
export async function getRegionalData(region) {
  const fallback = () => ({
    insightText: '',
    metrics: {
      activeProjects: 0,
      plannedDeliveryThisMonth: 0,
      deliveredThisMonth: 0,
      deliveredRatio: 0,
      riskProjects: 0
    },
    projects: [],
    riskProjects: [],
    resourceLoad: {
      categories: [],
      load: [],
      threshold: []
    }
  })
  
  return safeAdapterCall('getRegionalData', fallback, region)
}

/**
 * 获取项目更新列表
 * @returns {Promise<ProjectUpdate[]>}
 */
export async function getProjectUpdates() {
  return safeAdapterCall('getProjectUpdates', () => [])
}

/**
 * 获取工单列表
 * @returns {Promise<WorkOrder[]>}
 */
export async function getWorkOrders() {
  return safeAdapterCall('getWorkOrders', () => [])
}

/**
 * 获取归因分析数据
 * @param {string} kpi - KPI名称
 * @returns {Promise<AttributionData>}
 */
export async function getAttributionData(kpi) {
  const fallback = () => ({
    type: '',
    summary: '',
    factors: [],
    recommendations: []
  })
  
  return safeAdapterCall('getAttributionData', fallback, kpi)
}

/**
 * 获取资金数据
 * @param {string} projectId - 项目ID
 * @returns {Promise<FundData>}
 */
export async function getFundData(projectId) {
  return safeAdapterCall('getFundData', emptyStructures.fundData, projectId)
}

/**
 * 获取支出数据
 * @param {string} projectId - 项目ID
 * @returns {Promise<ExpenditureData>}
 */
export async function getExpenditureData(projectId) {
  return safeAdapterCall('getExpenditureData', emptyStructures.expenditureData, projectId)
}

/**
 * 获取人员数据
 * @param {string} projectId - 项目ID
 * @returns {Promise<PersonnelData>}
 */
export async function getPersonnelData(projectId) {
  return safeAdapterCall('getPersonnelData', emptyStructures.personnelData, projectId)
}

/**
 * 获取任务数据
 * @param {string} projectId - 项目ID
 * @param {string} kpi - KPI名称
 * @returns {Promise<TaskData>}
 */
export async function getTaskData(projectId, kpi) {
  return safeAdapterCall('getTaskData', emptyStructures.taskData, projectId, kpi)
}
