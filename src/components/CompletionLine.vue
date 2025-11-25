<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>{{ isOverview ? '进度兑现指数（折线）' : (selectedKpi ? selectedKpi + '（折线）' : '（折线）') }}</h3>
    </div>
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
const emit = defineEmits(['stats-changed'])

// --- Chart Logic ---
// 缓存 KPI 模式的示例数据，避免每次点击都重新生成
const mockCache = new Map()

const el = ref(null)
let chart = null
let resizeObserver = null

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries], () => {
  setTimeout(() => render(), 0)
}, { deep: true })

onMounted(()=>{
  if (props.selectedKpi !== '资金到账率') {
    render()
  }
  // Observe the container, not the chart element directly, or handle nulls
  // For simplicity, we'll try to observe if el exists, otherwise we might need a wrapper
})

onBeforeUnmount(()=>{
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if(chart){ chart.dispose(); chart=null }
})

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
  
  function buildDateLabels(len){
    function fmt(d){ const m = (d.getMonth()+1).toString().padStart(2,'0'); const day = d.getDate().toString().padStart(2,'0'); return m+'-'+day }
    const base = new Date(); base.setHours(0,0,0,0)
    const arr = []
    for(let i=len-1;i>=0;i--){ const d = new Date(base); d.setDate(base.getDate()-i); arr.push(fmt(d)) }
    return arr
  }

  if (props.isOverview && props.projectSeries && props.projectSeries.length > 0) {
    actualRates = props.projectSeries.map(v => v / 100)
    const len = actualRates.length
    xAxisData = buildDateLabels(len)
  } else {
    const days = 60
    xAxisData = buildDateLabels(days)
    
    const key = props.selectedKpi || '任务完成率'
    let data = mockCache.get(key)
    if (!data) {
      data = generateMockData(key)
      mockCache.set(key, data)
    }
    actualRates = data.actualRates
    planRates = data.planRates
  }

  // 移除交点逻辑：不再计算实际与计划交点
  const markPointData = []

  const axisLine = '#d1d5db'
  const axisLabel = '#6b7280'
  const gridLine = '#f3f4f6'
  let isUp = true
  if (actualRates.length >= 2) {
    const prev = actualRates[actualRates.length - 2]
    const last = actualRates[actualRates.length - 1]
    isUp = (last - prev) >= 0
  }
  const actualLine = isUp ? '#15803d' : '#dc2626'
  const areaStart = isUp ? 'rgba(21,128,61,0.45)' : 'rgba(220,38,38,0.25)'
  const areaEnd = isUp ? 'rgba(187,247,208,0.05)' : 'rgba(255,255,255,0)'

  if (actualRates.length) {
    const last = actualRates[actualRates.length - 1]
    const prev = actualRates.length > 1 ? actualRates[actualRates.length - 2] : null
    const planLast = planRates && planRates.length ? planRates[planRates.length - 1] : null
    emit('stats-changed', { last, prev, planLast, isUp, isOverview: props.isOverview, kpi: props.selectedKpi })
  }
  const lineWidthActual = 2
  
  const seriesNameActual = props.isOverview ? '实际进度' : '实际' + (props.selectedKpi || '')
  const seriesNamePlan = !props.isOverview ? ('计划' + (props.selectedKpi || '')) : null

  const option = {
    legend: { top: 0, right: 16, itemGap: 10, icon: 'rect', itemWidth: 14, itemHeight: 2 },
    grid: { left: 50, right: 24, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
    yAxis: { type: 'value', min: 0, max: 1, axisLine: { show: false }, splitLine: { show: !props.isOverview, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => Math.round(v*100)+'%' } },
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


/* Generic Chart Box */
.chart-box {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>