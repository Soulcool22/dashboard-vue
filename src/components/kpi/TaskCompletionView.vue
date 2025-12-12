<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>任务完成率（折线）</h3>
    </div>
    <div ref="el" class="chart-box"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] },
  completionSeries: {
    type: Object,
    default: () => ({ dates: [], planCounts: [], actualCounts: [], planRates: [], actualRates: [], totalTasks: 0 })
  }
})
const emit = defineEmits(['stats-changed'])

const el = ref(null)
let chart = null
let resizeObserver = null

// 缓存模拟数据
const mockCache = ref(null)

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries, props.completionSeries], () => {
  setTimeout(() => render(), 0)
}, { deep: true })

onMounted(() => {
  render()
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (chart) {
    chart.dispose()
    chart = null
  }
})

function generateMockData() {
  const days = 60
  const planRates = []
  const actualRates = []
  
  // 简单直线：从10%到90%
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1)
    const rate = 0.1 + 0.8 * t
    planRates.push(rate)
    actualRates.push(rate)
  }
  
  return { planRates, actualRates }
}

function render() {
  if (!el.value) return
  if (chart && chart.getDom && chart.getDom() !== el.value) {
    chart.dispose()
    chart = null
  }
  if (!chart) {
    chart = echarts.init(el.value)
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(() => chart && chart.resize())
    } else {
      resizeObserver.disconnect()
    }
    resizeObserver.observe(el.value)
  }
  
  let actualData = []
  let planData = []
  let xAxisData = []
  let totalTasks = 0
  
  function buildDateLabels(len) {
    function fmt(d) {
      const m = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')
      return m + '-' + day
    }
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    const arr = []
    for (let i = len - 1; i >= 0; i--) {
      const d = new Date(base)
      d.setDate(base.getDate() - i)
      arr.push(fmt(d))
    }
    return arr
  }

  const hasCompletionSeries = !props.isOverview &&
    props.completionSeries &&
    Array.isArray(props.completionSeries.dates) &&
    props.completionSeries.dates.length > 0 &&
    props.completionSeries.totalTasks > 0

  if (hasCompletionSeries) {
    // 使用真实任务数量作为纵轴数据
    actualData = props.completionSeries.actualCounts || []
    planData = props.completionSeries.planCounts || []
    totalTasks = props.completionSeries.totalTasks
    xAxisData = props.completionSeries.dates.map(d => {
      if (!d) return ''
      const parts = d.split('-')
      return parts.length === 3 ? `${parts[1]}-${parts[2]}` : d
    })
  } else if (props.isOverview && props.projectSeries && props.projectSeries.length > 0) {
    actualData = props.projectSeries.map(v => v / 100)
    const len = actualData.length
    xAxisData = buildDateLabels(len)
  } else {
    const days = 60
    xAxisData = buildDateLabels(days)
    
    if (!mockCache.value) {
      mockCache.value = generateMockData()
    }
    actualData = mockCache.value.actualRates
    planData = mockCache.value.planRates
  }

  const markPointData = []

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'
  let isUp = true
  if (actualData.length >= 2) {
    const prev = actualData[actualData.length - 2]
    const last = actualData[actualData.length - 1]
    isUp = (last - prev) >= 0
  }
  const actualLine = isUp ? '#15803d' : '#dc2626'
  const areaStart = isUp ? 'rgba(21,128,61,0.45)' : 'rgba(220,38,38,0.25)'
  const areaEnd = isUp ? 'rgba(187,247,208,0.05)' : 'rgba(255,255,255,0)'

  // 发送KPI卡片数据（使用百分比）
  if (actualData.length) {
    let lastRate = 0, prevRate = 0, planLastRate = 0
    if (hasCompletionSeries && totalTasks > 0) {
      // 真实数据：从actualRates获取百分比
      const rates = props.completionSeries.actualRates || []
      const planRates = props.completionSeries.planRates || []
      lastRate = rates.length ? rates[rates.length - 1] : 0
      prevRate = rates.length > 1 ? rates[rates.length - 2] : 0
      planLastRate = planRates.length ? planRates[planRates.length - 1] : 0
    } else if (props.isOverview && props.projectSeries && props.projectSeries.length > 0) {
      lastRate = actualData[actualData.length - 1]
      prevRate = actualData.length > 1 ? actualData[actualData.length - 2] : 0
    } else if (mockCache.value) {
      lastRate = mockCache.value.actualRates[mockCache.value.actualRates.length - 1]
      prevRate = mockCache.value.actualRates.length > 1 ? mockCache.value.actualRates[mockCache.value.actualRates.length - 2] : 0
      planLastRate = mockCache.value.planRates[mockCache.value.planRates.length - 1]
    }
    emit('stats-changed', { last: lastRate, prev: prevRate, planLast: planLastRate, isUp, isOverview: props.isOverview, kpi: '任务完成率' })
  }
  const lineWidthActual = 2
  
  const seriesNameActual = props.isOverview ? '实际进度' : '实际完成任务数'
  const seriesNamePlan = (!props.isOverview && planData && planData.length) ? '计划完成任务数' : null

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: {
      type: 'value',
      min: 0,
      max: hasCompletionSeries ? totalTasks : 1,
      axisLine: { show: false },
      splitLine: { show: !props.isOverview, lineStyle: { color: gridLine } },
      axisLabel: {
        color: axisLabel,
        formatter: function (value) {
          if (hasCompletionSeries) {
            return value
          } else {
            return Math.round(value * 100) + '%'
          }
        }
      }
    },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let tooltipStr = params[0].axisValue + '<br/>'
        params.forEach(param => {
          const value = param.value
          let percentage = ''
          if (hasCompletionSeries && totalTasks > 0) {
            percentage = ` (${(value / totalTasks * 100).toFixed(1)}%)`
          } else if (!hasCompletionSeries && !props.isOverview) {
            percentage = ` (${(value * 100).toFixed(1)}%)`
          }
          tooltipStr += `${param.seriesName}: ${value}${percentage}<br/>`
        })
        
        let actualVal = null, planVal = null
        params.forEach(param => {
          if (param.seriesName === seriesNameActual) actualVal = param.value
          if (param.seriesName === seriesNamePlan) planVal = param.value
        })

        if (actualVal !== null && planVal !== null && hasCompletionSeries && totalTasks > 0) {
          const diffCount = actualVal - planVal
          const diffRate = (diffCount / totalTasks * 100).toFixed(1)
          const s = diffCount > 0 ? '超前' : diffCount < 0 ? '落后' : '持平'
          tooltipStr += `差异: ${diffCount}条 (${diffRate}%) ${s}`
        } else if (actualVal !== null && planVal !== null && !hasCompletionSeries && !props.isOverview) {
          const diffRate = ((actualVal - planVal) * 100).toFixed(1)
          const s = parseFloat(diffRate) > 0 ? '超前' : parseFloat(diffRate) < 0 ? '落后' : '持平'
          tooltipStr += `差异(实-计): ${diffRate}% ${s}`
        }
        
        return tooltipStr
      }
    },
    series: (function () {
      const arr = [
        {
          name: seriesNameActual,
          type: 'line',
          data: actualData,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: lineWidthActual, color: actualLine },
          emphasis: { focus: 'series', lineStyle: { width: lineWidthActual + 1 } },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: areaStart }, { offset: 1, color: areaEnd }]) },
          markPoint: { symbol: 'circle', symbolSize: 7, data: markPointData }
        }
      ]
      if (!props.isOverview && planData && planData.length) {
        arr.push({ name: seriesNamePlan, type: 'line', data: planData, smooth: true, showSymbol: false, lineStyle: { width: lineWidthActual + 0.5, color: '#64748b', type: 'dashed' } })
      }
      return arr
    })()
  }
  
  chart.setOption(option, true)
}
</script>

<style scoped>
.card-header {
  margin-bottom: 12px;
}
.card-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.chart-box {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>

