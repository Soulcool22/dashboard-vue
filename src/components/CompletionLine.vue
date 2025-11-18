<template>
  <div class="card chart-card">
    <h3>任务完成率（折线）</h3>
    <div ref="el" class="chart-box"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'

const el = ref(null)
let chart = null
let resizeObserver = null

onMounted(()=>{
  render()
  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(el.value)
})

onBeforeUnmount(()=>{
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if(chart){ chart.dispose(); chart=null }
})
function onResize(){ if(chart) chart.resize() }

function render(){
  if(!el.value) return
  chart = echarts.init(el.value)
  const days = 60
  function fmt(d){ const m = (d.getMonth()+1).toString().padStart(2,'0'); const day = d.getDate().toString().padStart(2,'0'); return m+'-'+day }
  const dates = []; const base = new Date(); base.setHours(0,0,0,0)
  for(let i=days-1;i>=0;i--){ const d = new Date(base); d.setDate(base.getDate()-i); dates.push(fmt(d)) }
  const planStart = 0.12, planEnd = 0.98
  const planRates = []
  for(let i=0;i<days;i++){
    const t = i/(days-1)
    let rate
    if(t < 0.15){ rate = planStart + (0.25 - planStart) * (t/0.15) * (t/0.15) }
    else if(t < 0.4){ const lt = (t - 0.15)/0.25; rate = 0.25 + (0.45 - 0.25) * (1 - Math.pow(1 - lt, 2.5)) }
    else if(t < 0.7){ const lt = (t - 0.4)/0.3; rate = 0.45 + (0.75 - 0.45) * lt * (2 - lt) }
    else { const lt = (t - 0.7)/0.3; rate = 0.75 + (planEnd - 0.75) * (1 - Math.pow(1 - lt, 1.5)) }
    const variation = (Math.sin(i * 0.3) * 0.02 + Math.sin(i * 0.7) * 0.01)
    planRates.push(Math.min(1, Math.max(0, rate + variation)))
  }
  const actualRates = []
  for(let i=0;i<days;i++){
    const planRate = planRates[i]
    let actualRate
    if(i < 10){ const lag = 0.20 + 0.10 * (1 - i/10) + Math.sin(i * 0.5) * 0.03; actualRate = Math.max(0.02, planRate - lag) }
    else if(i < 25){ const cu = 0.15 - 0.08 * ((i - 10)/15) + Math.sin(i * 0.4) * 0.04; actualRate = Math.min(1, planRate - cu) }
    else if(i < 45){ const ph = Math.sin((i - 25) * 0.25) * 0.08; const tr = -0.05 + 0.15 * ((i - 25)/20); actualRate = Math.min(1, Math.max(0.1, planRate + tr + ph)) }
    else if(i < 65){ const sg = 0.08 + 0.12 * ((i - 45)/20) + Math.sin(i * 0.35) * 0.05; actualRate = Math.min(1, planRate + sg) }
    else { const mt = 0.15 + Math.sin((i - 65) * 0.4) * 0.06; actualRate = Math.min(1, planRate + mt) }
    if(i > 0 && actualRate < actualRates[i-1] * 0.85){ actualRate = actualRates[i-1] * 0.92 }
    actualRates.push(Math.max(0.01, actualRate))
  }

  // Simple, robust logic to find the FIRST intersection
  const markPointData = [];
  for (let i = 1; i < days; i++) {
    if (actualRates[i-1] < planRates[i-1] && actualRates[i] >= planRates[i]) {
      markPointData.push({
        name: '交点',
        coord: [i, actualRates[i]],
        itemStyle: {
          color: '#fff',
          borderColor: '#3a7afe',
          borderWidth: 2
        },
        label: { show: false }
      });
      break; // Found the first one, stop looking
    }
  }

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'
  const actualLine = '#15803d'
  const areaStart = 'rgba(21,128,61,0.45)'
  const areaEnd = 'rgba(187,247,208,0.05)'
  const planLine = '#64748b'
  const lineWidthActual = 2
  const lineWidthPlan = 2
  chart.setOption({
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: dates, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'value', min: 0, max: 1, axisLine: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => Math.round(v*100)+'%' } },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: { trigger: 'axis', formatter: function(params){ let a=null, p=null; params.forEach(x=>{ if(x.seriesName==='实际任务完成率') a=x.value; if(x.seriesName==='计划完成率') p=x.value; }); const lines = params.map(x=> x.seriesName + ': ' + (x.value*100).toFixed(1) + '%'); const diff = (a!=null && p!=null) ? ((a-p)*100).toFixed(1) + '%' : ''; const s = diff ? (parseFloat(diff)>0 ? '超前' : parseFloat(diff)<0 ? '落后' : '持平') : ''; return params[0].axisValue + '<br/>' + lines.join('<br/>') + (diff?('<br/>差异(实-计): ' + diff + ' ' + s):''); } },
    series: [
      { 
        name: '实际任务完成率', 
        type: 'line', 
        data: actualRates, 
        smooth: true, 
        showSymbol: false, 
        lineStyle: { width: lineWidthActual, color: actualLine }, 
        emphasis: { focus: 'series', lineStyle: { width: lineWidthActual + 1 } }, 
        areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[ { offset: 0, color: areaStart }, { offset: 1, color: areaEnd } ]) },
        markPoint: {
          symbol: 'circle',
          symbolSize: 7,
          data: markPointData
        }
      },
      { name: '计划完成率', type: 'line', data: planRates, smooth: true, showSymbol: false, lineStyle: { width: lineWidthPlan + 0.5, color: planLine, type: 'dashed', opacity: 1, dashOffset: 0, cap: 'round' } }
    ]
  })
}
</script>

<style scoped>
</style>