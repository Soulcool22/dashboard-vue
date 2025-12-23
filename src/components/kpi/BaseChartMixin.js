// src/components/kpi/BaseChartMixin.js
// 图表基础逻辑 - 提取 ResizeObserver 和图表初始化逻辑
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { buildDateLabels } from '../../utils/dateHelpers'
import { dashboardConfig } from '../../config'

/**
 * 创建图表基础逻辑的组合式函数
 * @returns {Object} 图表相关的响应式引用和方法
 */
export function useBaseChart() {
  const el = ref(null)
  let chart = null
  let resizeObserver = null

  /**
   * 初始化图表实例
   * @returns {echarts.ECharts|null} echarts实例
   */
  function initChart() {
    if (!el.value) return null
    
    // 如果图表已存在但DOM元素变化，需要重新初始化
    if (chart && chart.getDom && chart.getDom() !== el.value) {
      chart.dispose()
      chart = null
    }
    
    if (!chart) {
      chart = echarts.init(el.value)
      setupResizeObserver()
    }
    
    return chart
  }

  /**
   * 设置 ResizeObserver 监听容器大小变化
   */
  function setupResizeObserver() {
    if (!el.value) return
    
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    
    resizeObserver = new ResizeObserver(() => {
      if (chart) {
        chart.resize()
      }
    })
    
    resizeObserver.observe(el.value)
  }

  /**
   * 销毁图表和清理资源
   */
  function disposeChart() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (chart) {
      chart.dispose()
      chart = null
    }
  }

  /**
   * 获取当前图表实例
   * @returns {echarts.ECharts|null}
   */
  function getChart() {
    return chart
  }

  /**
   * 设置图表配置
   * @param {Object} option - echarts配置对象
   * @param {boolean} notMerge - 是否不合并配置
   */
  function setOption(option, notMerge = true) {
    const chartInstance = initChart()
    if (chartInstance) {
      chartInstance.setOption(option, notMerge)
    }
  }

  /**
   * 获取图表高度配置
   * @returns {number}
   */
  function getChartHeight() {
    return dashboardConfig.display?.chartHeight || 250
  }

  // 组件卸载时自动清理
  onBeforeUnmount(() => {
    disposeChart()
  })

  return {
    el,
    initChart,
    disposeChart,
    getChart,
    setOption,
    getChartHeight,
    buildDateLabels
  }
}

/**
 * 图表通用样式配置
 */
export const chartStyles = {
  axisLine: '#d1d5db',
  axisLabel: '#6b7280',
  gridLine: '#f3f4f6',
  planLine: '#64748b',
  upColor: '#15803d',
  downColor: '#dc2626',
  
  /**
   * 获取趋势颜色（上升/下降）
   * @param {boolean} isUp - 是否上升
   * @param {boolean} invertColors - 是否反转颜色（如逾期率，上升是坏的）
   * @returns {Object} 颜色配置
   */
  getTrendColors(isUp, invertColors = false) {
    const actualUp = invertColors ? !isUp : isUp
    const lineColor = actualUp ? this.upColor : this.downColor
    const areaStart = actualUp 
      ? 'rgba(21,128,61,0.45)' 
      : 'rgba(220,38,38,0.25)'
    const areaEnd = actualUp 
      ? 'rgba(187,247,208,0.05)' 
      : 'rgba(255,255,255,0)'
    
    return { lineColor, areaStart, areaEnd }
  }
}

/**
 * 创建基础折线图配置
 * @param {Object} params - 配置参数
 * @returns {Object} echarts配置对象
 */
export function createLineChartOption({
  xAxisData = [],
  actualRates = [],
  planRates = [],
  actualSeriesName = '实际完成率',
  planSeriesName = '计划完成率',
  isUp = true,
  invertColors = false,
  showPlanLine = true
}) {
  const colors = chartStyles.getTrendColors(isUp, invertColors)
  const lineWidth = 2

  const series = [
    {
      name: actualSeriesName,
      type: 'line',
      data: actualRates,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: colors.lineColor },
      lineStyle: { width: lineWidth, color: colors.lineColor },
      emphasis: { focus: 'series', lineStyle: { width: lineWidth + 1 } },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors.areaStart },
          { offset: 1, color: colors.areaEnd }
        ])
      },
      markPoint: { symbol: 'circle', symbolSize: 7, data: [] }
    }
  ]

  if (showPlanLine && planRates.length > 0) {
    series.push({
      name: planSeriesName,
      type: 'line',
      data: planRates,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: chartStyles.planLine },
      lineStyle: { width: lineWidth + 0.5, color: chartStyles.planLine, type: 'dashed' }
    })
  }

  return {
    color: [colors.lineColor, chartStyles.planLine],
    legend: { top: 0, right: 16, itemGap: 10, itemWidth: 24 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: { lineStyle: { color: chartStyles.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: chartStyles.axisLabel }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLine: { show: false },
      splitLine: { show: true, lineStyle: { color: chartStyles.gridLine } },
      axisLabel: { color: chartStyles.axisLabel, formatter: v => Math.round(v * 100) + '%' }
    },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    series
  }
}

export default {
  useBaseChart,
  chartStyles,
  createLineChartOption
}
