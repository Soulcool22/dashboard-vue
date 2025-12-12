<template>
  <component :is="currentComp" v-bind="compProps" @stats-changed="onStatsChanged" />
</template>

<script setup>
import { computed } from 'vue'
import ProjectOverviewView from './kpi/ProjectOverviewView.vue'
import FundArrivalView from './kpi/FundArrivalView.vue'
import ProjectExpenditureView from './kpi/ProjectExpenditureView.vue'
import PersonnelHealthView from './kpi/PersonnelHealthView.vue'
import TaskCompletionView from './kpi/TaskCompletionView.vue'
import OverdueTaskView from './kpi/OverdueTaskView.vue'

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

const viewMap = {
  '资金到账率': FundArrivalView,
  '任务完成率': TaskCompletionView,
  '项目支出金额': ProjectExpenditureView,
  '人员健康度': PersonnelHealthView,
  '逾期任务率': OverdueTaskView
}

const currentComp = computed(() => {
  // 如果没有选中KPI（概览模式），显示项目概览组件
  if (!props.selectedKpi || props.isOverview) {
    return ProjectOverviewView
  }
  // 否则根据selectedKpi返回对应的KPI组件
  return viewMap[props.selectedKpi] || ProjectOverviewView
})

const compProps = computed(() => {
  if (currentComp.value === ProjectOverviewView) {
    return { projectSeries: props.projectSeries }
  }
  const baseProps = { selectedKpi: props.selectedKpi, isOverview: props.isOverview, projectSeries: props.projectSeries }
  if (currentComp.value === TaskCompletionView) {
    return { ...baseProps, completionSeries: props.completionSeries }
  }
  return baseProps
})

function onStatsChanged(e){
  emit('stats-changed', e)
}
</script>

<style scoped>
</style>