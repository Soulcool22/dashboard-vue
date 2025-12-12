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
  projectSeries: { type: Array, default: () => [] }
})
const emit = defineEmits(['stats-changed'])

const el = ref(null)
let chart = null
let resizeObserver = null

// 缓存模拟数据
const mockCache = ref(null)

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries], () => {
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
  
  const planStart = 0.15
  const planEnd = 0.92

  for (let i = 0; i < days; i++) {
    const t = i / (days - 1)
    let rate = planStart + (planEnd - planStart) * t
    rate += Math.sin(t * Math.PI * 2.5) * 0.05
    planRates.push(Math.min(1, Math.max(0, rate)))
  }

  for (let i = 0; i < days; i++) {
    const planRate = planRates[i]
    let variation = (Math.random() - 0.5) * 0.1
    if (i > 30) variation += 0.03
    let actualRate = planRate + variation
    actualRate = Math.min(1, Math.max(0, actualRate))
    actualRates.push(actualRate)
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
  
  let actualRates = []
  let planRates = []
  let xAxisData = []
  
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
  actualRates = mockCache.value.actualRates
  planRates = mockCache.value.planRates

  const markPointData = []

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'
  let isUp = true
  if (actualRates.length >= 2) {
    const prev = actualRates[actualRates.length - 2]
    const last = actualRates[actualRates.length - 1]
    isUp = (last - prev) >= 0
  }
  const actualLine = isUp ? '#15803d' : '#dc2626'
  const areaStart = isUp ? 'rgba(21,128,61,0.45)' : 'rgba(220,38,38,0.25)'
  const areaEnd = isUp ? 'rgba(187,247,208,0.05)' : 'rgba(255,255,255,0)'

  if (actualRates.length) {
    const last = actualRates[actualRates.length - 1]
    const prev = actualRates.length > 1 ? actualRates[actualRates.length - 2] : null
    const planLast = planRates && planRates.length ? planRates[planRates.length - 1] : null
    emit('stats-changed', { last, prev, planLast, isUp, isOverview: props.isOverview, kpi: '任务完成率' })
  }
  const lineWidthActual = 2
  
  const seriesNameActual = '实际任务完成率'
  const seriesNamePlan = '计划任务完成率'

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'value', min: 0, max: 1, axisLine: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => Math.round(v * 100) + '%' } },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: { 
      trigger: 'axis', 
      formatter: function(params) { 
        let a = null, p = null
        params.forEach(x => { 
          if (x.seriesName === seriesNameActual) a = x.value
          if (x.seriesName === seriesNamePlan) p = x.value
        })
        const lines = params.map(x => x.seriesName + ': ' + (x.value * 100).toFixed(1) + '%')
        const diff = (a != null && p != null) ? ((a - p) * 100).toFixed(1) + '%' : ''
        const s = diff ? (parseFloat(diff) > 0 ? '超前' : parseFloat(diff) < 0 ? '落后' : '持平') : ''
        return params[0].axisValue + '<br/>' + lines.join('<br/>') + (diff ? ('<br/>差异(实-计): ' + diff + ' ' + s) : '')
      } 
    },
    series: [
      { 
        name: seriesNameActual, 
        type: 'line', 
        data: actualRates, 
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
        data: planRates, 
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
