/**
 * 错误处理模块
 * 提供数据加载错误处理和错误信息格式化功能
 */

/**
 * 数据加载错误类
 * @extends Error
 */
export class DataLoadError extends Error {
  /**
   * 创建数据加载错误实例
   * @param {string} message - 错误消息
   * @param {string} source - 错误来源（如数据源名称）
   * @param {Error} [originalError] - 原始错误对象
   */
  constructor(message, source, originalError) {
    super(message)
    this.name = 'DataLoadError'
    this.source = source
    this.originalError = originalError
  }
}

/**
 * 获取用户友好的错误消息
 * @param {Error} error - 错误对象
 * @returns {string} 用户友好的错误消息
 */
function getErrorMessage(error) {
  if (error instanceof DataLoadError) {
    return `数据加载失败: ${error.source}`
  }
  if (error.message?.includes('network')) {
    return '网络连接失败，请检查网络后重试'
  }
  return '数据加载失败，请稍后重试'
}

/**
 * 判断错误是否可重试
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否可重试
 */
function isRetryable(error) {
  // 网络错误可重试，数据格式错误不可重试
  return error.message?.includes('network') || 
         error.message?.includes('timeout')
}

/**
 * 处理数据错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文（如组件名称）
 * @returns {Object} 错误处理结果
 * @returns {boolean} result.hasError - 是否有错误
 * @returns {string} result.errorMessage - 用户友好的错误消息
 * @returns {boolean} result.canRetry - 是否可重试
 */
export function handleDataError(error, context) {
  console.error(`[${context}] Data error:`, error)
  
  return {
    hasError: true,
    errorMessage: getErrorMessage(error),
    canRetry: isRetryable(error)
  }
}
