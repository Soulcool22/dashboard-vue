<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>逾期任务率（折线）</h3>
    </div>
    <!-- 空状态显示 -->
    <EmptyState 
      v-if="isEmpty"
      title="暂无数据"
      description="逾期任务率数据尚未接入"
      icon="chart"
      variant="chart"
    />
    <div v-else ref="el" class="chart-box" :style="{ height: chartHeight + 'px' }"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import * as echarts from 'echarts'
import * as dataService from '../../services/dataService'
import { useBaseChart, chartStyles, createLineChartOption } from './BaseChartMixin'
import { buildDateLabels } from '../../utils/dateHelpers'
import EmptyState from '../EmptyState.vue'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] },
  project: { type: Object, default: () => null }
})
const emit = defineEmits(['stats-changed'])

// 使用基础图表逻辑
const { el, initChart, setOption, getChartHeight } = useBaseChart()
const chartHeight = computed(() => getChartHeight())

const projectId = computed(() => props.project?.id || props.project?.projectId || props.project?.name || null)
const taskData = ref({ xAxis: [], actualRates: [], planRates: [] })

// 判断是否为空数据
const isEmpty = computed(() => {
  const actualRates = taskData.value.actualRates
  return !Array.isArray(actualRates) || actualRates.length === 0
})

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries, props.project], () => {
  setTimeout(() => render(), 0)
}, { deep: true })

onMounted(() => {
  render()
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
  
  const chart = initChart()
  if (!chart) return

  const actualRates = Array.isArray(taskData.value.actualRates) ? taskData.value.actualRates : []
  const planRates = Array.isArray(taskData.value.planRates) ? taskData.value.planRates : []
  
  let xAxisData = []
  if (Array.isArray(taskData.value.xAxis) && taskData.value.xAxis.length) {
    xAxisData = taskData.value.xAxis
  } else if (actualRates.length) {
    xAxisData = buildDateLabels(actualRates.length)
  }

  // 逾期任务率：向上（增加）是不好的，用红色；向下（减少）是好的，用绿色
  let isUp = true
  if (actualRates.length >= 2) {
    const prev = actualRates[actualRates.length - 2]
    const last = actualRates[actualRates.length - 1]
    isUp = (last - prev) >= 0
  }

  // 发送统计数据
  const last = actualRates.length ? actualRates[actualRates.length - 1] : 0
  const prev = actualRates.length > 1 ? actualRates[actualRates.length - 2] : null
  const planLast = planRates && planRates.length ? planRates[planRates.length - 1] : null
  // 注意：对于逾期率，向下（减少）才是好的，所以isUp的含义需要反转给上层
  emit('stats-changed', { last, prev, planLast, isUp: !isUp, isOverview: props.isOverview, kpi: '逾期任务率' })

  // 使用基础配置创建图表选项，invertColors=true 因为逾期率上升是坏的
  const option = createLineChartOption({
    xAxisData,
    actualRates,
    planRates,
    actualSeriesName: '实际逾期任务率',
    planSeriesName: '计划任务完成率',
    isUp,
    invertColors: true  // 逾期率上升显示红色，下降显示绿色
  })

  // 添加自定义tooltip
  option.tooltip = {
    trigger: 'axis',
    formatter: function(params) {
      let actualVal = null, planVal = null
      params.forEach(x => {
        if (x.seriesName === '实际逾期任务率') actualVal = x.value
        if (x.seriesName === '计划任务完成率') planVal = x.value
      })
      const lines = params.map(x => x.seriesName + ': ' + (x.value * 100).toFixed(1) + '%')
      const diff = (actualVal != null && planVal != null) ? ((actualVal - planVal) * 100).toFixed(1) + '%' : ''
      // 对于逾期率，低于计划是好的
      const s = diff ? (parseFloat(diff) > 0 ? '超标' : parseFloat(diff) < 0 ? '达标' : '持平') : ''
      return params[0].axisValue + '<br/>' + lines.join('<br/>') + (diff ? ('<br/>差异(实-计): ' + diff + ' ' + s) : '')
    }
  }

  setOption(option)
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
  width: 100%;
}
</style>
