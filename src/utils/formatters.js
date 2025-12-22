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
