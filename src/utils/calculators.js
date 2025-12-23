/**
 * 计算函数模块
 * 提供统一的变化量计算、比率计算和序列数据处理方法
 */

/**
 * 计算变化量
 * @param {number} current - 当前值
 * @param {number} previous - 前一个值
 * @returns {{value: number, isUp: boolean}} 变化量对象，包含绝对值和方向
 */
export function calculateDelta(current, previous) {
  const curr = Number(current)
  const prev = Number(previous)
  
  // 处理无效输入
  if (!Number.isFinite(curr)) {
    return { value: 0, isUp: true }
  }
  
  if (!Number.isFinite(prev) || prev === 0) {
    return { value: 0, isUp: true }
  }
  
  const delta = curr - prev
  return {
    value: Math.abs(delta),
    isUp: delta >= 0
  }
}

/**
 * 计算比率
 * @param {number} numerator - 分子
 * @param {number} denominator - 分母
 * @returns {number} 比率值，分母为0或结果非有限数时返回0
 */
export function calculateRate(numerator, denominator) {
  const num = Number(numerator)
  const denom = Number(denominator)
  
  if (!Number.isFinite(num) || !Number.isFinite(denom) || denom === 0) {
    return 0
  }
  
  const result = num / denom
  // Handle edge case where division results in Infinity (very small denominator)
  return Number.isFinite(result) ? result : 0
}

/**
 * 获取序列最后一个值
 * @param {number[]} series - 数值序列
 * @returns {number} 最后一个值，空序列返回0
 */
export function getSeriesLastValue(series) {
  if (!Array.isArray(series) || series.length === 0) {
    return 0
  }
  
  const lastValue = Number(series[series.length - 1])
  return Number.isFinite(lastValue) ? lastValue : 0
}

/**
 * 获取序列变化量（最后两个值的差）
 * @param {number[]} series - 数值序列
 * @returns {{value: number, isUp: boolean}} 变化量对象
 */
export function getSeriesDelta(series) {
  if (!Array.isArray(series) || series.length < 2) {
    return { value: 0, isUp: true }
  }
  
  const last = Number(series[series.length - 1])
  const prev = Number(series[series.length - 2])
  
  return calculateDelta(last, prev)
}

/**
 * 获取序列变化符号（正、负或零）
 * @param {number[]} series - 数值序列
 * @returns {number} 变化值（正数、负数或0）
 */
export function getSeriesDeltaSign(series) {
  if (!Array.isArray(series) || series.length < 2) {
    return 0
  }
  const last = Number(series[series.length - 1] || 0)
  const prev = Number(series[series.length - 2] || 0)
  return last - prev
}

/**
 * 计算序列平均值
 * @param {number[]} series - 数值序列
 * @returns {number} 平均值，空序列返回0
 */
export function getSeriesAverage(series) {
  if (!Array.isArray(series) || series.length === 0) {
    return 0
  }
  const sum = series.reduce((s, v) => s + Number(v || 0), 0)
  return sum / series.length
}

/**
 * 计算序列中位数
 * @param {number[]} series - 数值序列
 * @returns {number} 中位数，空序列返回0
 */
export function getSeriesMedian(series) {
  if (!Array.isArray(series) || series.length === 0) {
    return 0
  }
  const sorted = series.slice().map(v => Number(v || 0)).sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
