/**
 * KPI 详情视图单元测试
 * 测试阈值配置和图表复用逻辑
 * Requirements: 3.3, 5.2
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getThreshold, dashboardConfig } from '../../config'
import { chartStyles } from '../kpi/BaseChartMixin'

// Mock echarts with proper constructor
vi.mock('echarts', () => {
  class MockLinearGradient {
    constructor(x1, y1, x2, y2, colorStops) {
      this.colorStops = colorStops
    }
  }
  return {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
      getDom: vi.fn()
    })),
    graphic: {
      LinearGradient: MockLinearGradient
    }
  }
})

describe('KPI Detail Views', () => {
  describe('Personnel Risk Threshold Configuration (Requirement 3.3)', () => {
    it('should have personnelRisk thresholds in config', () => {
      expect(dashboardConfig.thresholds.personnelRisk).toBeDefined()
      expect(dashboardConfig.thresholds.personnelRisk.projectCountLimit).toBeDefined()
      expect(dashboardConfig.thresholds.personnelRisk.healthyScore).toBeDefined()
      expect(dashboardConfig.thresholds.personnelRisk.warningScore).toBeDefined()
    })

    it('getThreshold returns correct personnelRisk values', () => {
      const projectCountLimit = getThreshold('personnelRisk', 'projectCountLimit')
      const healthyScore = getThreshold('personnelRisk', 'healthyScore')
      const warningScore = getThreshold('personnelRisk', 'warningScore')

      expect(projectCountLimit).toBe(3)
      expect(healthyScore).toBe(80)
      expect(warningScore).toBe(60)
    })

    it('getThreshold returns undefined for non-existent keys', () => {
      expect(getThreshold('personnelRisk', 'nonExistent')).toBeUndefined()
      expect(getThreshold('nonExistent', 'key')).toBeUndefined()
    })
  })

  describe('Chart Styles Configuration', () => {
    it('should have correct default style values', () => {
      expect(chartStyles.axisLine).toBe('#d1d5db')
      expect(chartStyles.axisLabel).toBe('#6b7280')
      expect(chartStyles.gridLine).toBe('#f3f4f6')
      expect(chartStyles.planLine).toBe('#64748b')
      expect(chartStyles.upColor).toBe('#15803d')
      expect(chartStyles.downColor).toBe('#dc2626')
    })

    it('getTrendColors returns correct colors for upward trend', () => {
      const colors = chartStyles.getTrendColors(true, false)
      expect(colors.lineColor).toBe('#15803d')
      expect(colors.areaStart).toContain('21,128,61')
    })

    it('getTrendColors returns correct colors for downward trend', () => {
      const colors = chartStyles.getTrendColors(false, false)
      expect(colors.lineColor).toBe('#dc2626')
      expect(colors.areaStart).toContain('220,38,38')
    })

    it('getTrendColors inverts colors when invertColors is true', () => {
      // For overdue rate: up is bad (red), down is good (green)
      const colorsUp = chartStyles.getTrendColors(true, true)
      expect(colorsUp.lineColor).toBe('#dc2626') // inverted: up shows red

      const colorsDown = chartStyles.getTrendColors(false, true)
      expect(colorsDown.lineColor).toBe('#15803d') // inverted: down shows green
    })
  })

  describe('createLineChartOption (Requirement 5.2)', () => {
    // Import createLineChartOption after mock is set up
    let createLineChartOption
    
    beforeEach(async () => {
      // Dynamic import to ensure mock is applied
      const module = await import('../kpi/BaseChartMixin')
      createLineChartOption = module.createLineChartOption
    })

    it('creates valid chart option with required properties', () => {
      const option = createLineChartOption({
        xAxisData: ['01-01', '01-02', '01-03'],
        actualRates: [0.5, 0.6, 0.7],
        planRates: [0.55, 0.65, 0.75],
        actualSeriesName: '实际完成率',
        planSeriesName: '计划完成率',
        isUp: true
      })

      expect(option.xAxis.data).toEqual(['01-01', '01-02', '01-03'])
      expect(option.series).toHaveLength(2)
      expect(option.series[0].name).toBe('实际完成率')
      expect(option.series[1].name).toBe('计划完成率')
      expect(option.legend).toBeDefined()
      expect(option.grid).toBeDefined()
      expect(option.yAxis).toBeDefined()
    })

    it('creates chart option without plan line when showPlanLine is false', () => {
      const option = createLineChartOption({
        xAxisData: ['01-01', '01-02'],
        actualRates: [0.5, 0.6],
        planRates: [],
        showPlanLine: false
      })

      expect(option.series).toHaveLength(1)
    })

    it('creates chart option with correct trend colors', () => {
      const optionUp = createLineChartOption({
        xAxisData: ['01-01'],
        actualRates: [0.5],
        isUp: true
      })
      expect(optionUp.color[0]).toBe('#15803d')

      const optionDown = createLineChartOption({
        xAxisData: ['01-01'],
        actualRates: [0.5],
        isUp: false
      })
      expect(optionDown.color[0]).toBe('#dc2626')
    })

    it('handles empty data gracefully', () => {
      const option = createLineChartOption({
        xAxisData: [],
        actualRates: [],
        planRates: []
      })

      expect(option.xAxis.data).toEqual([])
      expect(option.series[0].data).toEqual([])
    })
  })

  describe('Chart Height Configuration', () => {
    it('should have chartHeight in display config', () => {
      expect(dashboardConfig.display.chartHeight).toBeDefined()
      expect(dashboardConfig.display.chartHeight).toBe(250)
    })
  })
})
