<template>
  <div ref="el" class="wl-spark"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({ series: { type: Array, default: () => [] } })
const el = ref(null)
let chart = null

function render(){
  if(!el.value) return
  if(!chart) chart = echarts.init(el.value)
  const a = props.series
  const prev = a[a.length-2]
  const last = a[a.length-1]
  const isUp = (last - prev) >= 0
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    grid: { left: -4, right: 4, top: 2, bottom: 2 },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: false }, data: a.map((_,i)=>i) },
    yAxis: { type: 'value', min: 'dataMin', max: 'dataMax', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: false } },
    series: [{ type: 'line', data: a, smooth: true, showSymbol: false, symbol: 'none', lineStyle: { width: 2, color: isUp ? '#15803d' : '#dc2626' }, itemStyle: { color: isUp ? '#15803d' : '#dc2626' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[ { offset: 0, color: isUp ? 'rgba(21,128,61,0.45)' : 'rgba(220,38,38,0.25)' }, { offset: 1, color: 'rgba(255,255,255,0)' } ]) }, markLine: { data: [{ yAxis: 80, lineStyle: { type: 'dashed', color: '#d1d5db', width: 1 } }], symbol: 'none', label: { show: false } } }]
  })
}

onMounted(()=>{ render(); window.addEventListener('resize', onResize) })
onBeforeUnmount(()=>{ window.removeEventListener('resize', onResize); if(chart){ chart.dispose(); chart=null } })
function onResize(){ if(chart) chart.resize() }
watch(()=>props.series, ()=> render(), { deep: true })
</script>

<style scoped>
</style>