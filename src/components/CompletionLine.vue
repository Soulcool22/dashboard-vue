<template>
  <div class="card chart-card">
    <h3>{{ isOverview ? '进度兑现指数（折线）' : (selectedKpi ? selectedKpi + '（折线）' : '（折线）') }}</h3>
    <div ref="el" class="chart-box"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] }
})

const el = ref(null)
let chart = null
let resizeObserver = null

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries], () => {
  render()
}, { deep: true })

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

function generateMockData(seedStr) {
  const days = 60
  const planRates = []
  const actualRates = []
  
  // Simple hash-like function to vary trends based on seed
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  const randomFactor = Math.abs(seed % 10) / 10; // 0 to 0.9

  // Base curve logic customized by randomFactor
  const planStart = 0.1 + (randomFactor * 0.05)
  const planEnd = 0.9 + (randomFactor * 0.08)

  for(let i=0;i<days;i++){
    const t = i/(days-1)
    // Create a sigmoid-like or linear progression
    let rate = planStart + (planEnd - planStart) * t;
    
    // Add some waviness
    rate += Math.sin(t * Math.PI * (2 + randomFactor)) * 0.05;
    
    planRates.push(Math.min(1, Math.max(0, rate)))
  }

  for(let i=0;i<days;i++){
    const planRate = planRates[i]
    // Actual varies around plan
    let variation = (Math.random() - 0.5) * 0.1 + (randomFactor - 0.5) * 0.05;
    
    // Lag or lead trend based on index
    if (i > 30) variation += 0.05 * (randomFactor > 0.5 ? 1 : -1);

    let actualRate = planRate + variation;
    actualRate = Math.min(1, Math.max(0, actualRate))
    actualRates.push(actualRate)
  }
  
  return { planRates, actualRates }
}

function render(){
  if(!el.value) return
  if (!chart) {
    chart = echarts.init(el.value)
  }
  
  let actualRates = []
  let planRates = []
  let xAxisData = []
  
  if (props.isOverview && props.projectSeries && props.projectSeries.length > 0) {
    // Overview Mode: Use project series data
    // Normalize 0-100 to 0-1
    actualRates = props.projectSeries.map(v => v / 100)
    const len = actualRates.length
    
    // Use indices as x-axis labels for consistency with sparkline
    xAxisData = Array.from({ length: len }, (_, i) => String(i + 1))

    // 移除参考线：不再生成计划线

  } else {
    const days = 60
    function fmt(d){ const m = (d.getMonth()+1).toString().padStart(2,'0'); const day = d.getDate().toString().padStart(2,'0'); return m+'-'+day }
    const base = new Date(); base.setHours(0,0,0,0)
    for(let i=days-1;i>=0;i--){ const d = new Date(base); d.setDate(base.getDate()-i); xAxisData.push(fmt(d)) }
    
    const data = generateMockData(props.selectedKpi || '任务完成率')
    actualRates = data.actualRates
    planRates = data.planRates
  }

  // 移除交点逻辑：不再计算实际与计划交点
  const markPointData = []

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'
  const actualLine = '#15803d'
  const areaStart = 'rgba(21,128,61,0.45)'
  const areaEnd = 'rgba(187,247,208,0.05)'
  const lineWidthActual = 2
  
  const seriesNameActual = props.isOverview ? '实际进度' : '实际' + (props.selectedKpi || '')
  const seriesNamePlan = !props.isOverview ? ('计划' + (props.selectedKpi || '')) : null

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'value', min: 0, max: 1, axisLine: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => Math.round(v*100)+'%' } },
    dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
    tooltip: { 
        trigger: 'axis', 
        formatter: function(params){ 
            let a=null, p=null; 
            params.forEach(x=>{ 
                if(x.seriesName===seriesNameActual) a=x.value; 
                if(seriesNamePlan && x.seriesName===seriesNamePlan) p=x.value; 
            }); 
            const lines = params.map(x=> x.seriesName + ': ' + (x.value*100).toFixed(1) + '%'); 
            const diff = (a!=null && p!=null) ? ((a-p)*100).toFixed(1) + '%' : '';
            const s = diff ? (parseFloat(diff)>0 ? '超前' : parseFloat(diff)<0 ? '落后' : '持平') : '';
            return params[0].axisValue + '<br/>' + lines.join('<br/>') + (diff?('<br/>差异(实-计): ' + diff + ' ' + s):''); 
        } 
    },
    series: (function(){
      const arr = [
        { 
          name: seriesNameActual, 
          type: 'line', 
          data: actualRates, 
          smooth: true, 
          showSymbol: false, 
          lineStyle: { width: lineWidthActual, color: actualLine }, 
          emphasis: { focus: 'series', lineStyle: { width: lineWidthActual + 1 } }, 
          areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[ { offset: 0, color: areaStart }, { offset: 1, color: areaEnd } ]) },
          markPoint: { symbol: 'circle', symbolSize: 7, data: markPointData }
        }
      ]
      if (!props.isOverview && planRates && planRates.length) {
        arr.push({ name: seriesNamePlan, type: 'line', data: planRates, smooth: true, showSymbol: false, lineStyle: { width: lineWidthActual + 0.5, color: '#64748b', type: 'dashed' } })
      }
      return arr
    })()
  }
  
  chart.setOption(option, true) // true = notMerge, force update
}
</script>

<style scoped>
</style>