/**
 * 数据服务层单元测试
 * 测试适配器切换和空数据处理
 * Requirements: 2.7, 2.8
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  setDataAdapter,
  getDataAdapter,
  clearDataAdapter,
  getProjects,
  getKpis,
  getRiskProjects,
  getProjectSeries,
  getCompanyInsights,
  getRegionalData,
  getProjectUpdates,
  getWorkOrders,
  getAttributionData,
  getFundData,
  getExpenditureData,
  getPersonnelData,
  getTaskData
} from '../../src/services/dataService'
import { emptyStructures } from '../../src/services/dataTypes'
import { dashboardConfig } from '../../src/config'

describe('dataService', () => {
  beforeEach(() => {
    clearDataAdapter()
    vi.restoreAllMocks()
  })

  // =========================================================================
  // 适配器切换测试 (Requirement 2.8)
  // =========================================================================
  describe('适配器切换', () => {
    it('setDataAdapter should set the adapter', () => {
      const mockAdapter = { getProjects: vi.fn() }
      setDataAdapter(mockAdapter)
      expect(getDataAdapter()).toBe(mockAdapter)
    })

    it('clearDataAdapter should clear the adapter', () => {
      const mockAdapter = { getProjects: vi.fn() }
      setDataAdapter(mockAdapter)
      clearDataAdapter()
      expect(getDataAdapter()).toBeNull()
    })

    it('should use new adapter after switching', async () => {
      const adapter1 = { getProjects: vi.fn().mockResolvedValue([{ id: '1' }]) }
      const adapter2 = { getProjects: vi.fn().mockResolvedValue([{ id: '2' }]) }

      setDataAdapter(adapter1)
      const result1 = await getProjects()
      expect(result1).toEqual([{ id: '1' }])

      setDataAdapter(adapter2)
      const result2 = await getProjects()
      expect(result2).toEqual([{ id: '2' }])
    })
  })

  // =========================================================================
  // 空数据处理测试 (Requirement 2.7)
  // =========================================================================
  describe('空数据处理 - 无适配器', () => {
    it('getProjects should return empty array when no adapter', async () => {
      const result = await getProjects()
      expect(result).toEqual([])
    })

    it('getKpis should return default KPI structure when no adapter', async () => {
      const result = await getKpis('project-1')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(dashboardConfig.kpis.length)
      result.forEach((kpi, index) => {
        expect(kpi.title).toBe(dashboardConfig.kpis[index].title)
        expect(kpi.value).toBe('0%')
      })
    })

    it('getRiskProjects should return empty array when no adapter', async () => {
      const result = await getRiskProjects('east')
      expect(result).toEqual([])
    })

    it('getProjectSeries should return empty array when no adapter', async () => {
      const result = await getProjectSeries('project-1')
      expect(result).toEqual([])
    })

    it('getCompanyInsights should return empty structure when no adapter', async () => {
      const result = await getCompanyInsights()
      expect(result).toHaveProperty('summaryText', '')
      expect(result).toHaveProperty('metrics')
      expect(result.metrics.healthIndex).toBe(0)
      expect(result).toHaveProperty('trend')
      expect(result.trend.xAxis).toEqual([])
    })


    it('getRegionalData should return empty structure when no adapter', async () => {
      const result = await getRegionalData('east')
      expect(result).toHaveProperty('insightText', '')
      expect(result).toHaveProperty('metrics')
      expect(result.metrics.activeProjects).toBe(0)
      expect(result).toHaveProperty('projects')
      expect(result.projects).toEqual([])
    })

    it('getProjectUpdates should return empty array when no adapter', async () => {
      const result = await getProjectUpdates()
      expect(result).toEqual([])
    })

    it('getWorkOrders should return empty array when no adapter', async () => {
      const result = await getWorkOrders()
      expect(result).toEqual([])
    })

    it('getAttributionData should return empty structure when no adapter', async () => {
      const result = await getAttributionData('任务完成率')
      expect(result).toHaveProperty('type', '')
      expect(result).toHaveProperty('summary', '')
      expect(result).toHaveProperty('factors')
      expect(result.factors).toEqual([])
    })

    it('getFundData should return empty structure when no adapter', async () => {
      const result = await getFundData('project-1')
      const expected = emptyStructures.fundData()
      expect(result).toEqual(expected)
    })

    it('getExpenditureData should return empty structure when no adapter', async () => {
      const result = await getExpenditureData('project-1')
      const expected = emptyStructures.expenditureData()
      expect(result).toEqual(expected)
    })

    it('getPersonnelData should return empty structure when no adapter', async () => {
      const result = await getPersonnelData('project-1')
      const expected = emptyStructures.personnelData()
      expect(result).toEqual(expected)
    })

    it('getTaskData should return empty structure when no adapter', async () => {
      const result = await getTaskData('project-1', '任务完成率')
      const expected = emptyStructures.taskData()
      expect(result).toEqual(expected)
    })
  })

  // =========================================================================
  // 适配器错误处理测试 (Requirement 2.7)
  // =========================================================================
  describe('适配器错误处理', () => {
    it('should return fallback when adapter method throws', async () => {
      const errorAdapter = {
        getProjects: vi.fn().mockRejectedValue(new Error('Network error'))
      }
      setDataAdapter(errorAdapter)
      
      const result = await getProjects()
      expect(result).toEqual([])
    })

    it('should return fallback when adapter method is not a function', async () => {
      const incompleteAdapter = {
        getProjects: 'not a function'
      }
      setDataAdapter(incompleteAdapter)
      
      const result = await getProjects()
      expect(result).toEqual([])
    })

    it('should return KPI fallback when adapter getKpis throws', async () => {
      const errorAdapter = {
        getKpis: vi.fn().mockRejectedValue(new Error('Data error'))
      }
      setDataAdapter(errorAdapter)
      
      const result = await getKpis('project-1')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(dashboardConfig.kpis.length)
    })

    it('should return fund fallback when adapter getFundData throws', async () => {
      const errorAdapter = {
        getFundData: vi.fn().mockRejectedValue(new Error('Data error'))
      }
      setDataAdapter(errorAdapter)
      
      const result = await getFundData('project-1')
      expect(result).toEqual(emptyStructures.fundData())
    })
  })

  // =========================================================================
  // 适配器正常调用测试
  // =========================================================================
  describe('适配器正常调用', () => {
    it('should call adapter getProjects and return data', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', isWatched: true, series: [] },
        { id: '2', name: 'Project 2', isWatched: false, series: [] }
      ]
      const adapter = { getProjects: vi.fn().mockResolvedValue(mockProjects) }
      setDataAdapter(adapter)
      
      const result = await getProjects()
      expect(adapter.getProjects).toHaveBeenCalled()
      expect(result).toEqual(mockProjects)
    })

    it('should pass projectId to adapter getKpis', async () => {
      const mockKpis = [{ title: 'Test KPI', value: '50%' }]
      const adapter = { getKpis: vi.fn().mockResolvedValue(mockKpis) }
      setDataAdapter(adapter)
      
      const result = await getKpis('project-123')
      expect(adapter.getKpis).toHaveBeenCalledWith('project-123')
      expect(result).toEqual(mockKpis)
    })

    it('should pass region to adapter getRiskProjects', async () => {
      const mockRiskProjects = [{ id: '1', riskLevel: 'high' }]
      const adapter = { getRiskProjects: vi.fn().mockResolvedValue(mockRiskProjects) }
      setDataAdapter(adapter)
      
      const result = await getRiskProjects('east')
      expect(adapter.getRiskProjects).toHaveBeenCalledWith('east')
      expect(result).toEqual(mockRiskProjects)
    })

    it('should pass projectId and kpi to adapter getTaskData', async () => {
      const mockTaskData = { xAxis: ['01-01'], actualRates: [0.5], planRates: [0.6] }
      const adapter = { getTaskData: vi.fn().mockResolvedValue(mockTaskData) }
      setDataAdapter(adapter)
      
      const result = await getTaskData('project-1', '任务完成率')
      expect(adapter.getTaskData).toHaveBeenCalledWith('project-1', '任务完成率')
      expect(result).toEqual(mockTaskData)
    })
  })
})
