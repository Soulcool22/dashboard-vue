/**
 * App.vue 单元测试
 * 测试区域列表从配置加载
 * Requirements: 3.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { getRegions, dashboardConfig } from '../../config'

// Mock the dataService to avoid actual data loading
vi.mock('../../services/dataService', () => ({
  getProjects: vi.fn(() => Promise.resolve([])),
  getKpis: vi.fn(() => Promise.resolve([])),
  getProjectSeries: vi.fn(() => Promise.resolve([]))
}))

describe('App.vue Region Configuration', () => {
  describe('getRegions configuration function', () => {
    it('should return regions from dashboardConfig', () => {
      const regions = getRegions()
      expect(regions).toBe(dashboardConfig.regions)
    })

    it('should return an array of region objects', () => {
      const regions = getRegions()
      expect(Array.isArray(regions)).toBe(true)
      expect(regions.length).toBeGreaterThan(0)
    })

    it('should have required properties for each region', () => {
      const regions = getRegions()
      regions.forEach(region => {
        expect(region).toHaveProperty('id')
        expect(region).toHaveProperty('name')
        expect(typeof region.id).toBe('string')
        expect(typeof region.name).toBe('string')
      })
    })

    it('should have exactly one default region', () => {
      const regions = getRegions()
      const defaultRegions = regions.filter(r => r.isDefault === true)
      expect(defaultRegions.length).toBe(1)
    })

    it('should contain expected region names', () => {
      const regions = getRegions()
      const regionNames = regions.map(r => r.name)
      expect(regionNames).toContain('全国')
    })
  })

  describe('Region list integration', () => {
    it('should map region objects to region names correctly', () => {
      const configRegions = getRegions()
      const regionNames = configRegions.map(r => r.name)
      
      expect(regionNames).toEqual(dashboardConfig.regions.map(r => r.name))
    })

    it('should find default region correctly', () => {
      const configRegions = getRegions()
      const defaultRegion = configRegions.find(r => r.isDefault)?.name || configRegions[0]?.name || '全国'
      
      expect(defaultRegion).toBe('全国')
    })
  })
})
