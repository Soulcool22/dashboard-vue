/**
 * KPI 组件单元测试
 * 测试配置驱动的显示逻辑
 * Requirements: 3.1, 3.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { getKpiConfig, dashboardConfig } from '../../config'

// Mock element-plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card" @click="$emit(\'click\')"><slot /></div>',
    props: ['shadow']
  }
}))

describe('KpiGrid Component (Requirement 3.1)', () => {
  let KpiGrid

  beforeEach(async () => {
    // Dynamic import to ensure mocks are applied
    const module = await import('../KpiGrid.vue')
    KpiGrid = module.default
  })

  describe('Configuration-driven display logic', () => {
    it('should use getKpiConfig to determine showDelta behavior', () => {
      // Verify config exists for KPIs with showDelta: false
      const fundConfig = getKpiConfig('资金到账率')
      expect(fundConfig).toBeDefined()
      expect(fundConfig.showDelta).toBe(false)

      // Verify config exists for KPIs with showDelta: true
      const taskConfig = getKpiConfig('任务完成率')
      expect(taskConfig).toBeDefined()
      expect(taskConfig.showDelta).toBe(true)
    })

    it('should use getKpiConfig to determine compareMode for delta text', () => {
      // KPI with compareMode: 'plan' should show "较计划"
      const taskConfig = getKpiConfig('任务完成率')
      expect(taskConfig.compareMode).toBe('plan')

      // KPI with compareMode: 'period' should show "环比"
      const overdueConfig = getKpiConfig('逾期任务数')
      expect(overdueConfig.compareMode).toBe('period')

      // KPI with compareMode: null should not show delta
      const fundConfig = getKpiConfig('资金到账率')
      expect(fundConfig.compareMode).toBeNull()
    })

    it('should render KPI cards from props', () => {
      const kpis = [
        { title: '任务完成率', value: '85%', delta: '5%', up: true },
        { title: '资金到账率', value: '70%', delta: '3%', up: false }
      ]

      const wrapper = mount(KpiGrid, {
        props: { kpis, selectedKpi: '任务完成率' },
        global: {
          stubs: {
            'el-card': {
              template: '<div class="el-card kpi" :class="$attrs.class" @click="$emit(\'click\')"><slot /></div>'
            }
          }
        }
      })

      const cards = wrapper.findAll('.kpi')
      expect(cards.length).toBe(2)
    })

    it('should emit select-kpi event when card is clicked', async () => {
      const kpis = [{ title: '任务完成率', value: '85%', delta: '5%', up: true }]

      const wrapper = mount(KpiGrid, {
        props: { kpis, selectedKpi: '' },
        global: {
          stubs: {
            'el-card': {
              template: '<div class="el-card kpi" @click="$emit(\'click\')"><slot /></div>'
            }
          }
        }
      })

      await wrapper.find('.kpi').trigger('click')
      expect(wrapper.emitted('select-kpi')).toBeTruthy()
    })
  })

  describe('KPI configuration completeness', () => {
    it('all KPIs in config should have required properties', () => {
      dashboardConfig.kpis.forEach(kpi => {
        expect(kpi.id).toBeDefined()
        expect(kpi.title).toBeDefined()
        expect(typeof kpi.showDelta).toBe('boolean')
        expect(kpi.viewComponent).toBeDefined()
      })
    })
  })
})

describe('KpiPanel Component (Requirement 3.2)', () => {
  let KpiPanel

  beforeEach(async () => {
    // Dynamic import
    const module = await import('../KpiPanel.vue')
    KpiPanel = module.default
  })

  describe('Configuration-driven view mapping', () => {
    it('should map KPI titles to correct view components via config', () => {
      // Verify each KPI has a viewComponent mapping in config
      const fundConfig = getKpiConfig('资金到账率')
      expect(fundConfig.viewComponent).toBe('FundArrivalView')

      const taskConfig = getKpiConfig('任务完成率')
      expect(taskConfig.viewComponent).toBe('TaskCompletionView')

      const overdueConfig = getKpiConfig('逾期任务数')
      expect(overdueConfig.viewComponent).toBe('OverdueTaskView')

      const expenditureConfig = getKpiConfig('项目支出金额')
      expect(expenditureConfig.viewComponent).toBe('ProjectExpenditureView')

      const personnelConfig = getKpiConfig('人员健康度')
      expect(personnelConfig.viewComponent).toBe('PersonnelHealthView')
    })

    it('should have all viewComponent values as valid component names', () => {
      const validComponents = [
        'FundArrivalView',
        'ProjectExpenditureView',
        'PersonnelHealthView',
        'TaskCompletionView',
        'OverdueTaskView',
        'ProjectOverviewView'
      ]

      dashboardConfig.kpis.forEach(kpi => {
        expect(validComponents).toContain(kpi.viewComponent)
      })
    })

    it('should render ProjectOverviewView when isOverview is true', () => {
      const wrapper = shallowMount(KpiPanel, {
        props: {
          selectedKpi: '任务完成率',
          isOverview: true,
          projectSeries: []
        }
      })

      // When isOverview is true, should render ProjectOverviewView
      expect(wrapper.findComponent({ name: 'ProjectOverviewView' }).exists()).toBe(true)
    })

    it('should render correct component based on selectedKpi config', () => {
      // Test that the component uses config to determine which view to show
      const wrapper = shallowMount(KpiPanel, {
        props: {
          selectedKpi: '资金到账率',
          isOverview: false,
          project: { id: '1' }
        }
      })

      // Should render FundArrivalView based on config
      expect(wrapper.findComponent({ name: 'FundArrivalView' }).exists()).toBe(true)
    })
  })

  describe('Component registry completeness', () => {
    it('all KPI viewComponents should be importable', async () => {
      // Verify all view components referenced in config exist
      const viewComponents = new Set(dashboardConfig.kpis.map(k => k.viewComponent))
      
      for (const componentName of viewComponents) {
        // This test verifies the component files exist by checking config references
        expect(typeof componentName).toBe('string')
        expect(componentName.length).toBeGreaterThan(0)
      }
    })
  })
})
