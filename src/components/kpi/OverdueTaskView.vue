<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>逾期任务率（折线）</h3>
    </div>
    <div ref="el" class="chart-box"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import * as echarts from 'echarts'
import * as dataService from '../../services/dataService'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] },
  project: { type: Object, default: () => null }
})
const emit = defineEmits(['stats-changed'])

const el = ref(null)
let chart = null
let resizeObserver = null

const projectId = computed(() => props.project?.id || props.project?.projectId || props.project?.name || null)
const taskData = ref({ xAxis: [], actualRates: [], planRates: [] })

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries, props.project], () => {
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

async function load() {
  const data = await dataService.getTaskData(projectId.value, '逾期任务率')
  taskData.value = {
    xAxis: Array.isArray(data?.xAxis) ? data.xAxis : [],
    actualRates: Array.isArray(data?.actualRates) ? data.actualRates : [],
    planRates: Array.isArray(data?.planRates) ? data.planRates : []
  }
  setTimeout(() => render(), 0)
}

watch(() => projectId.value, () => {
  load()
}, { immediate: true })

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

  actualRates = Array.isArray(taskData.value.actualRates) ? taskData.value.actualRates : []
  planRates = Array.isArray(taskData.value.planRates) ? taskData.value.planRates : []
  if (Array.isArray(taskData.value.xAxis) && taskData.value.xAxis.length) {
    xAxisData = taskData.value.xAxis
  } else if (actualRates.length) {
    xAxisData = buildDateLabels(actualRates.length)
  } else {
    xAxisData = []
  }

  const markPointData = []

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'

  // 逾期任务率：向上（增加）是不好的，用红色；向下（减少）是好的，用绿色
  let isUp = true
  if (actualRates.length >= 2) {
    const prev = actualRates[actualRates.length - 2]
    const last = actualRates[actualRates.length - 1]
    isUp = (last - prev) >= 0
  }
  // 逾期数增加显示红色，减少显示绿色
  const actualLine = isUp ? '#dc2626' : '#15803d'
  const areaStart = isUp ? 'rgba(220,38,38,0.25)' : 'rgba(21,128,61,0.45)'
  const areaEnd = isUp ? 'rgba(255,255,255,0)' : 'rgba(187,247,208,0.05)'

  const last = actualRates.length ? actualRates[actualRates.length - 1] : 0
  const prev = actualRates.length > 1 ? actualRates[actualRates.length - 2] : null
  const planLast = planRates && planRates.length ? planRates[planRates.length - 1] : null
  // 注意：对于逾期率，向下（减少）才是好的，所以isUp的含义需要反转给上层
  emit('stats-changed', { last, prev, planLast, isUp: !isUp, isOverview: props.isOverview, kpi: '逾期任务率' })
  const lineWidthActual = 2

  const seriesNameActual = '实际逾期任务率'
  const seriesNamePlan = '计划逾期率阈值'

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'value', min: 0, max: 0.5, axisLine: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => Math.round(v * 100) + '%' } },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let actualVal = null, planVal = null
        params.forEach(x => {
          if (x.seriesName === seriesNameActual) actualVal = x.value
          if (x.seriesName === seriesNamePlan) planVal = x.value
        })
        const lines = params.map(x => x.seriesName + ': ' + (x.value * 100).toFixed(1) + '%')
        const diff = (actualVal != null && planVal != null) ? ((actualVal - planVal) * 100).toFixed(1) + '%' : ''
        // 对于逾期率，低于计划是好的
        const s = diff ? (parseFloat(diff) > 0 ? '超标' : parseFloat(diff) < 0 ? '达标' : '持平') : ''
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
