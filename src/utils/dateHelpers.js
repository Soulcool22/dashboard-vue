/**
 * 日期辅助函数模块
 * 提供日期标签生成和日期范围处理方法
 */

import { formatDate } from './formatters'

/**
 * 生成日期标签数组
 * @param {number} length - 标签数量
 * @param {Date} endDate - 结束日期，默认为当前日期
 * @returns {string[]} 日期标签数组，按升序排列
 */
export function buildDateLabels(length, endDate = new Date()) {
  if (!Number.isFinite(length) || length <= 0) {
    return []
  }
  
  const labels = []
  const base = new Date(endDate)
  
  // 处理无效日期
  if (isNaN(base.getTime())) {
    return []
  }
  
  base.setHours(0, 0, 0, 0)
  
  for (let i = length - 1; i >= 0; i--) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    labels.push(formatDate(d))
  }
  
  return labels
}

/**
 * 生成日期范围内的所有日期
 * @param {Date|string} start - 开始日期
 * @param {Date|string} end - 结束日期
 * @returns {Date[]} 日期数组，包含起止日期
 */
export function dateRangeInclusive(start, end) {
  if (!start || !end) {
    return []
  }
  
  const s = new Date(start)
  const e = new Date(end)
  
  // 处理无效日期
  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return []
  }
  
  s.setHours(0, 0, 0, 0)
  e.setHours(0, 0, 0, 0)
  
  // 如果开始日期大于结束日期，返回空数组
  if (s > e) {
    return []
  }
  
  const out = []
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d))
  }
  
  return out
}
