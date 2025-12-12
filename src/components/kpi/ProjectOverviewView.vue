<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>进度兑现指数（折线）</h3>
    </div>
    <div ref="el" class="chart-box"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  projectSeries: { type: Array, default: () => [] }
})
const emit = defineEmits(['stats-changed'])

const el = ref(null)
let chart = null
let resizeObserver = null

watch(() => props.projectSeries, () => {
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

  if (props.projectSeries && props.projectSeries.length > 0) {
    actualRates = props.projectSeries.map(v => v / 100)
    const len = actualRates.length
    xAxisData = buildDateLabels(len)
  } else {
    // 默认数据
    const days = 60
    xAxisData = buildDateLabels(days)
    actualRates = Array(days).fill(0).map((_, i) => 0.6 + (0.3 * i / (days - 1)))
  }

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
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
    emit('stats-changed', { last, prev, planLast: null, isUp, isOverview: true })
  }
  
  const lineWidthActual = 2

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { 
      type: 'category', 
      data: xAxisData, 
      boundaryGap: false, 
      axisLine: { lineStyle: { color: axisLine } }, 
      axisTick: { show: false }, 
      axisLabel: { color: axisLabel } 
    },
    yAxis: { 
      type: 'value', 
      min: 0, 
      max: 1, 
      axisLine: { show: false }, 
      splitLine: { show: false }, 
      axisLabel: { color: axisLabel, formatter: v => Math.round(v * 100) + '%' } 
    },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const value = (params[0].value * 100).toFixed(1) + '%'
        return params[0].axisValue + '<br/>实际进度: ' + value
      }
    },
    series: [
      {
        name: '实际进度',
        type: 'line',
        data: actualRates,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: lineWidthActual, color: actualLine },
        emphasis: { focus: 'series', lineStyle: { width: lineWidthActual + 1 } },
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: areaStart }, 
            { offset: 1, color: areaEnd }
          ]) 
        }
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

