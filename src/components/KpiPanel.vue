<template>
  <component :is="currentComp" v-bind="compProps" @stats-changed="onStatsChanged" />
</template>

<script setup>
import { computed } from 'vue'
import FundArrivalView from './kpi/FundArrivalView.vue'
import ProjectExpenditureView from './kpi/ProjectExpenditureView.vue'
import PersonnelHealthView from './kpi/PersonnelHealthView.vue'
import TaskCompletionView from './kpi/TaskCompletionView.vue'
import OverdueTaskView from './kpi/OverdueTaskView.vue'
import ProjectOverviewView from './kpi/ProjectOverviewView.vue'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] },
  project: { type: Object, default: () => null }
})
const emit = defineEmits(['stats-changed'])

const viewMap = {
  '资金到账率': FundArrivalView,
  '项目支出金额': ProjectExpenditureView,
  '人员健康度': PersonnelHealthView,
  '任务完成率': TaskCompletionView,
  '逾期任务率': OverdueTaskView
}

const currentComp = computed(() => {
  if (props.isOverview) {
    return ProjectOverviewView
  }
  return viewMap[props.selectedKpi] || ProjectOverviewView
})

const compProps = computed(() => {
  if (currentComp.value === ProjectOverviewView) {
    return { projectSeries: props.projectSeries }
  }
  if (currentComp.value === TaskCompletionView || currentComp.value === OverdueTaskView) {
    return { selectedKpi: props.selectedKpi, isOverview: props.isOverview, projectSeries: props.projectSeries, project: props.project }
  }
  return { project: props.project }
})

function onStatsChanged(e){
  emit('stats-changed', e)
}
</script>

<style scoped>
</style>