<template>
  <component :is="currentComp" v-bind="compProps" @stats-changed="onStatsChanged" />
</template>

<script setup>
import { computed } from 'vue'
import CompletionLine from './CompletionLine.vue'
import FundArrivalView from './kpi/FundArrivalView.vue'
import ProjectExpenditureView from './kpi/ProjectExpenditureView.vue'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] }
})
const emit = defineEmits(['stats-changed'])

const viewMap = {
  '资金到账率': FundArrivalView,
  '项目支出金额': ProjectExpenditureView
}

const currentComp = computed(() => {
  return viewMap[props.selectedKpi] || CompletionLine
})

const compProps = computed(() => {
  if (currentComp.value === CompletionLine) {
    return { selectedKpi: props.selectedKpi, isOverview: props.isOverview, projectSeries: props.projectSeries }
  }
  return {}
})

function onStatsChanged(e){
  emit('stats-changed', e)
}
</script>

<style scoped>
</style>