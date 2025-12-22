<template>
  <component :is="currentComp" v-bind="compProps" @stats-changed="onStatsChanged" />
</template>

<script setup>
import { computed } from 'vue'
import { getKpiConfig } from '../config'
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

// 组件名称到组件实例的映射（用于动态组件解析）
const componentRegistry = {
  FundArrivalView,
  ProjectExpenditureView,
  PersonnelHealthView,
  TaskCompletionView,
  OverdueTaskView,
  ProjectOverviewView
}

/**
 * 根据KPI标题从配置获取对应的视图组件
 * @param {string} kpiTitle - KPI标题
 * @returns {Component} Vue组件
 */
function getViewComponent(kpiTitle) {
  const kpiConfig = getKpiConfig(kpiTitle)
  if (kpiConfig && kpiConfig.viewComponent) {
    return componentRegistry[kpiConfig.viewComponent] || ProjectOverviewView
  }
  return ProjectOverviewView
}

const currentComp = computed(() => {
  if (props.isOverview) {
    return ProjectOverviewView
  }
  return getViewComponent(props.selectedKpi)
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