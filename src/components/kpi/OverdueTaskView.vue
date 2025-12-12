<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>逾期任务率（折线）</h3>
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
  overdueSeries: {
    type: Object,
    default: () => ({ dates: [], overdueRates: [], overdueCounts: [], shouldCompleteCounts: [], totalTasks: 0 })
  }
})
const emit = defineEmits(['stats-changed'])

const el = ref(null)
let chart = null
let resizeObserver = null

// 缓存模拟数据
const mockCache = ref(null)

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries, props.overdueSeries], () => {
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
  
  // 逾期任务率：从5%到25%（趋势向上表示逾期增多）
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1)
    const rate = 0.05 + 0.2 * t
    planRates.push(0.1) // 计划逾期率保持在10%
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
  
  let overdueData = []
  let shouldCompleteData = []
  let xAxisData = []
  let totalTasks = 0
  
  // 优先使用真实数据
  const series = props.overdueSeries
  if (series && series.dates && series.dates.length > 0) {
    xAxisData = series.dates.map(d => {
      const parts = d.split('-')
      return parts[1] + '-' + parts[2]
    })
    overdueData = series.overdueCounts || []
    shouldCompleteData = series.shouldCompleteCounts || []
    totalTasks = series.totalTasks || 0
  } else {
    // 回退到模拟数据
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
    const days = 60
    xAxisData = buildDateLabels(days)
    if (!mockCache.value) {
      mockCache.value = generateMockData()
    }
    // 转换为数量（模拟100个任务）
    totalTasks = 100
    overdueData = mockCache.value.actualRates.map(r => Math.round(r * totalTasks))
    shouldCompleteData = mockCache.value.planRates.map(() => Math.round(0.8 * totalTasks))
  }

  const markPointData = []

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'
  
  // 计算最大值用于Y轴
  const maxOverdue = Math.max(...overdueData, 1)
  const maxShouldComplete = Math.max(...shouldCompleteData, 1)
  const yAxisMax = Math.max(maxOverdue, maxShouldComplete) * 1.2
  
  // 逾期任务数：向上（增加）是不好的，用红色；向下（减少）是好的，用绿色
  let isUp = true
  if (overdueData.length >= 2) {
    const prev = overdueData[overdueData.length - 2]
    const last = overdueData[overdueData.length - 1]
    isUp = (last - prev) >= 0
  }
  // 逾期数增加显示红色，减少显示绿色
  const actualLine = isUp ? '#dc2626' : '#15803d'
  const areaStart = isUp ? 'rgba(220,38,38,0.25)' : 'rgba(21,128,61,0.45)'
  const areaEnd = isUp ? 'rgba(255,255,255,0)' : 'rgba(187,247,208,0.05)'

  // 计算逾期率用于KPI卡片
  if (overdueData.length && shouldCompleteData.length) {
    const lastOverdue = overdueData[overdueData.length - 1]
    const lastShouldComplete = shouldCompleteData[shouldCompleteData.length - 1]
    const overdueRate = lastShouldComplete > 0 ? lastOverdue / lastShouldComplete : 0
    const prevOverdue = overdueData.length > 1 ? overdueData[overdueData.length - 2] : null
    const prevShouldComplete = shouldCompleteData.length > 1 ? shouldCompleteData[shouldCompleteData.length - 2] : null
    const prevRate = (prevOverdue !== null && prevShouldComplete > 0) ? prevOverdue / prevShouldComplete : null
    // 注意：对于逾期率，向下（减少）才是好的，所以isUp的含义需要反转给上层
    emit('stats-changed', { 
      last: overdueRate, 
      prev: prevRate, 
      planLast: 0.1, // 计划逾期率阈值10%
      isUp: !isUp, 
      isOverview: props.isOverview, 
      kpi: '逾期任务率',
      overdueCount: lastOverdue,
      shouldCompleteCount: lastShouldComplete
    })
  }
  const lineWidthActual = 2
  
  const seriesNameActual = '逾期任务数'
  const seriesNamePlan = '应完成任务数'

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'value', min: 0, max: Math.ceil(yAxisMax), axisLine: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => v + '个' } },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let overdueVal = null, shouldCompleteVal = null
        params.forEach(x => {
          if (x.seriesName === seriesNameActual) overdueVal = x.value
          if (x.seriesName === seriesNamePlan) shouldCompleteVal = x.value
        })
        const rate = (overdueVal !== null && shouldCompleteVal > 0) ? (overdueVal / shouldCompleteVal * 100).toFixed(1) + '%' : '-'
        const lines = params.map(x => x.seriesName + ': ' + x.value + '个')
        return params[0].axisValue + '<br/>' + lines.join('<br/>') + '<br/>逾期率: ' + rate
      }
    },
    series: [
      {
        name: seriesNameActual,
        type: 'line',
        data: overdueData,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: lineWidthActual, color: actualLine },
        emphasis: { focus: 'series', lineStyle: { width: lineWidthActual + 1 } },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: areaStart }, { offset: 1, color: areaEnd }]) },
        markPoint: { symbol: 'circle', symbolSize: 7, data: markPointData }
      },
      {
        name: seriesNamePlan,
        type: 'line',
        data: shouldCompleteData,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: lineWidthActual + 0.5, color: '#64748b', type: 'dashed' }
      }
    ]
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

