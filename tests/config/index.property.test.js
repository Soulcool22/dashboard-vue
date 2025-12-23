/**
 * 配置管理器属性测试
 * Property 1: 配置完整性
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 * 
 * Feature: dashboard-refactoring, Property 1: 配置完整性
 */
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { dashboardConfig, getKpiConfig, getRegions, getThreshold } from '../../src/config/index.js'

describe('Config Manager Property Tests', () => {
  /**
   * Property 1: 配置完整性
   * For any dashboard configuration object, it SHALL contain all required 
   * configuration sections (regions, kpis, thresholds, display) with valid values.
   * Validates: Requirements 1.1, 1.2, 1.3, 1.4
   */
  describe('Property 1: 配置完整性', () => {
    it('dashboardConfig SHALL contain all required sections', () => {
      // Verify all required top-level sections exist
      expect(dashboardConfig).toHaveProperty('regions')
      expect(dashboardConfig).toHaveProperty('kpis')
      expect(dashboardConfig).toHaveProperty('thresholds')
      expect(dashboardConfig).toHaveProperty('display')
    })

    it('regions section SHALL have valid structure (Requirement 1.1)', () => {
      fc.assert(
        fc.property(
          fc.constant(dashboardConfig.regions),
          (regions) => {
            // Must be a non-empty array
            if (!Array.isArray(regions) || regions.length === 0) return false
            
            // Each region must have id and name
            return regions.every(region => 
              typeof region.id === 'string' && 
              region.id.length > 0 &&
              typeof region.name === 'string' && 
              region.name.length > 0
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('kpis section SHALL have valid structure (Requirement 1.2)', () => {
      fc.assert(
        fc.property(
          fc.constant(dashboardConfig.kpis),
          (kpis) => {
            // Must be a non-empty array
            if (!Array.isArray(kpis) || kpis.length === 0) return false
            
            // Each KPI must have required properties
            return kpis.every(kpi => 
              typeof kpi.id === 'string' && kpi.id.length > 0 &&
              typeof kpi.title === 'string' && kpi.title.length > 0 &&
              (kpi.compareMode === null || typeof kpi.compareMode === 'string') &&
              typeof kpi.showDelta === 'boolean' &&
              typeof kpi.viewComponent === 'string' && kpi.viewComponent.length > 0
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('thresholds section SHALL have valid structure (Requirement 1.3, 1.4)', () => {
      fc.assert(
        fc.property(
          fc.constant(dashboardConfig.thresholds),
          (thresholds) => {
            // Must be an object with personnelRisk and projectRisk
            if (typeof thresholds !== 'object' || thresholds === null) return false
            if (!thresholds.personnelRisk || !thresholds.projectRisk) return false
            
            // personnelRisk must have required numeric thresholds
            const pr = thresholds.personnelRisk
            if (typeof pr.projectCountLimit !== 'number') return false
            if (typeof pr.healthyScore !== 'number') return false
            if (typeof pr.warningScore !== 'number') return false
            
            // projectRisk must have required numeric thresholds
            const pjr = thresholds.projectRisk
            if (typeof pjr.highRiskOverdueRate !== 'number') return false
            if (typeof pjr.mediumRiskOverdueRate !== 'number') return false
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('display section SHALL have valid structure', () => {
      fc.assert(
        fc.property(
          fc.constant(dashboardConfig.display),
          (display) => {
            if (typeof display !== 'object' || display === null) return false
            
            return (
              typeof display.defaultKpi === 'string' &&
              typeof display.chartHeight === 'number' &&
              typeof display.listPageSize === 'number'
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getKpiConfig SHALL return valid config for any existing KPI title', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...dashboardConfig.kpis.map(k => k.title)),
          (title) => {
            const config = getKpiConfig(title)
            return (
              config !== undefined &&
              config.title === title &&
              typeof config.id === 'string'
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getRegions SHALL return the complete regions array', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            const regions = getRegions()
            return (
              Array.isArray(regions) &&
              regions.length === dashboardConfig.regions.length &&
              regions.every((r, i) => r.id === dashboardConfig.regions[i].id)
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getThreshold SHALL return correct value for valid category and key', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('personnelRisk', 'projectRisk'),
          (category) => {
            const keys = Object.keys(dashboardConfig.thresholds[category])
            return keys.every(key => {
              const value = getThreshold(category, key)
              return value === dashboardConfig.thresholds[category][key]
            })
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
