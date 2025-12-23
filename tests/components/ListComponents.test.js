/**
 * 列表组件单元测试
 * 测试 WatchList 和 RegularList 组件的工具函数集成
 * Requirements: 4.5
 */
import { describe, it, expect } from 'vitest'
import {
  getSeriesLastValue,
  getSeriesDeltaSign,
  getSeriesAverage,
  getSeriesMedian,
  formatPercent,
  formatDeltaPercent,
  formatRatio,
  formatDeltaRatio,
  formatSeriesDeltaText
} from '../../src/utils'

describe('List Components Utility Integration', () => {
  describe('Series calculation functions', () => {
    it('getSeriesLastValue returns last value from series', () => {
      expect(getSeriesLastValue([10, 20, 30])).toBe(30)
      expect(getSeriesLastValue([85.5])).toBe(85.5)
      expect(getSeriesLastValue([])).toBe(0)
      expect(getSeriesLastValue(null)).toBe(0)
    })

    it('getSeriesDeltaSign returns correct sign', () => {
      expect(getSeriesDeltaSign([10, 20])).toBe(10) // positive
      expect(getSeriesDeltaSign([20, 10])).toBe(-10) // negative
      expect(getSeriesDeltaSign([10, 10])).toBe(0) // no change
      expect(getSeriesDeltaSign([10])).toBe(0) // single value
      expect(getSeriesDeltaSign([])).toBe(0) // empty
    })

    it('getSeriesAverage calculates correct average', () => {
      expect(getSeriesAverage([10, 20, 30])).toBe(20)
      expect(getSeriesAverage([100])).toBe(100)
      expect(getSeriesAverage([])).toBe(0)
    })

    it('getSeriesMedian calculates correct median', () => {
      expect(getSeriesMedian([1, 2, 3])).toBe(2) // odd length
      expect(getSeriesMedian([1, 2, 3, 4])).toBe(2.5) // even length
      expect(getSeriesMedian([5])).toBe(5) // single value
      expect(getSeriesMedian([])).toBe(0) // empty
    })
  })

  describe('Formatting functions', () => {
    it('formatPercent formats rate values correctly', () => {
      expect(formatPercent(0.85)).toBe('85%')
      expect(formatPercent(1)).toBe('100%')
      expect(formatPercent(0)).toBe('0%')
      expect(formatPercent(null)).toBe('0%')
    })

    it('formatDeltaPercent formats delta with arrow', () => {
      expect(formatDeltaPercent(0.1)).toBe('↑10%')
      expect(formatDeltaPercent(-0.05)).toBe('↓5%')
      expect(formatDeltaPercent(0)).toBe('↑0%')
      expect(formatDeltaPercent(undefined)).toBe('')
    })

    it('formatRatio formats ratio values correctly', () => {
      expect(formatRatio(1.25)).toBe('1.25')
      expect(formatRatio(0.5)).toBe('0.50')
      expect(formatRatio(undefined)).toBe('0.00')
    })

    it('formatDeltaRatio formats delta ratio with arrow', () => {
      expect(formatDeltaRatio(0.15)).toBe('↑0.15')
      expect(formatDeltaRatio(-0.25)).toBe('↓0.25')
      expect(formatDeltaRatio(undefined)).toBe('')
    })

    it('formatSeriesDeltaText formats series delta as percentage', () => {
      expect(formatSeriesDeltaText([100, 110])).toBe('↑10%')
      expect(formatSeriesDeltaText([100, 90])).toBe('↓10%')
      expect(formatSeriesDeltaText([100])).toBe('')
      expect(formatSeriesDeltaText([])).toBe('')
    })
  })
})
