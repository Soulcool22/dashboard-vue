/**
 * 格式化函数模块
 * 提供统一的数值、货币和日期格式化方法
 */

/**
 * 格式化百分比
 * @param {number|string} value - 要格式化的值（0-1之间的小数）
 * @param {number} decimals - 小数位数，默认为0
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercent(value, decimals = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0%'
  return (n * 100).toFixed(decimals) + '%'
}

/**
 * 格式化货币
 * @param {number|string} value - 要格式化的金额
 * @param {string} prefix - 货币前缀，默认为'¥'
 * @returns {string} 格式化后的货币字符串
 */
export function formatCurrency(value, prefix = '¥') {
  const n = Number(value || 0)
  return prefix + ' ' + new Intl.NumberFormat('en-US').format(n)
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 要格式化的日期
 * @param {string} format - 日期格式，默认为'MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'MM-DD') {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  
  if (format === 'MM-DD') return `${mm}-${dd}`
  if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`
  if (format === 'YYYY/MM/DD') return `${yyyy}/${mm}/${dd}`
  
  // 默认返回 MM-DD 格式
  return `${mm}-${dd}`
}

/**
 * 格式化比率（0-1之间的小数）为百分比，带方向箭头
 * @param {number|string} value - 要格式化的值（0-1之间的小数）
 * @returns {string} 格式化后的百分比字符串，带方向箭头
 */
export function formatDeltaPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  const s = n >= 0 ? '↑' : '↓'
  return s + Math.round(Math.abs(n) * 100) + '%'
}

/**
 * 格式化比率数值（保留两位小数）
 * @param {number|string} value - 要格式化的值
 * @returns {string} 格式化后的数值字符串
 */
export function formatRatio(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  return n.toFixed(2)
}

/**
 * 格式化比率变化量（保留两位小数，带方向箭头）
 * @param {number|string} value - 要格式化的值
 * @returns {string} 格式化后的变化量字符串
 */
export function formatDeltaRatio(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  const s = n >= 0 ? '↑' : '↓'
  return s + Math.abs(n).toFixed(2)
}

/**
 * 格式化序列变化量为百分比文本
 * @param {number[]} series - 数值序列
 * @returns {string} 格式化后的变化百分比字符串
 */
export function formatSeriesDeltaText(series) {
  if (!Array.isArray(series) || series.length < 2) return ''
  const prev = Number(series[series.length - 2] || 0)
  const last = Number(series[series.length - 1] || 0)
  const pct = prev ? (((last - prev) / prev) * 100).toFixed(2) : '0.00'
  const s = (last - prev) >= 0 ? '↑' : '↓'
  return s + Math.abs(Number(pct)) + '%'
}
