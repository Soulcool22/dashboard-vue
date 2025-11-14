<template>
  <div class="card chart-card">
    <h3>平均任务工期（计划 vs 实际）</h3>
    <div ref="el" class="chart-box sm"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'

const el = ref(null)
let chart = null

onMounted(()=>{ render(); window.addEventListener('resize', onResize) })
onBeforeUnmount(()=>{ window.removeEventListener('resize', onResize); if(chart){ chart.dispose(); chart=null } })
function onResize(){ if(chart) chart.resize() }

function render(){
  if(!el.value) return
  chart = echarts.init(el.value)
  const depts = ['深化','采购','生产','开发','实施']
  const planDays = [11,7,13,10,8]
  const actualDays = [13,10,18,12,9]
  const diffDays = actualDays.map((v,i)=>Math.max(0, v - planDays[i]))
  const axisLine = '#d7dceb'
  const axisLabel = '#8a94a6'
  chart.setOption({
    legend: { top: 6, right: 10, textStyle: { color: axisLabel }, icon: 'roundRect' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function(params){ const idx = params[0].dataIndex; const delta = actualDays[idx] - planDays[idx]; const rate = Math.round(actualDays[idx] / planDays[idx] * 100); const sign = delta >= 0 ? '+' : ''; return ['部门：'+depts[idx],'计划平均工期：'+planDays[idx]+' 天','实际平均工期：'+actualDays[idx]+' 天','工期比：'+rate+'%','差异：'+sign+delta+' 天'].join('<br/>'); } },
    grid: { left: 45, right: 75, top: 24, bottom: 32, containLabel: true },
    xAxis: { type: 'value', axisLine: { show: true, lineStyle: { color: axisLine } }, splitLine: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'category', data: depts, axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: '#2f3b52' } },
    series: [
      { name: '计划', type: 'bar', stack: 'total', data: planDays, barWidth: 22, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0,[ { offset: 0, color: '#f0f4f8' }, { offset: 1, color: '#e2e8f0' } ]), borderRadius: [6,0,0,6], shadowColor: 'rgba(0,0,0,0.04)', shadowBlur: 4 }, label: { show: true, position: 'inside', formatter: p => p.value + '天', color: '#4b5563', fontSize: 11, fontWeight: 500 }, emphasis: { focus: 'self', itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.18)' } }, animationEasing: 'cubicOut', animationDelay: idx => idx * 80, animationDuration: 600, animationDurationUpdate: 400 },
      { name: '实际超出', type: 'bar', stack: 'total', data: diffDays, barWidth: 22, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0,[ { offset: 0, color: '#ffb54d' }, { offset: 1, color: '#ff9a3d' } ]), borderRadius: [0,6,6,0], shadowColor: 'rgba(0,0,0,0.08)', shadowBlur: 4 }, label: { show: true, position: 'insideRight', formatter: p => p.value>0 ? ('+'+p.value+'天') : '', color: '#ffffff', fontSize: 11, fontWeight: 500 }, emphasis: { focus: 'self', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' } }, animationEasing: 'cubicOut', animationDelay: idx => idx * 80 + 40, animationDuration: 600, animationDurationUpdate: 400, universalTransition: true }
    ]
  })
}
</script>

<style scoped>
</style>