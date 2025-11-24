<template>
  <div class="card chart-card">
    <!-- Header -->
    <div class="card-header">
      <h3>{{ isOverview ? '进度兑现指数（折线）' : (selectedKpi ? selectedKpi + (selectedKpi === '资金到账率' ? '详情' : '（折线）') : '（折线）') }}</h3>
    </div>

    <!-- Specialized View for Fund Arrival Rate -->
    <div v-if="selectedKpi === '资金到账率'" class="fund-dashboard">
      <!-- Top Section: Overall Status -->
      <div class="fund-overview">
        <div class="fund-metric-box total">
          <div class="label">总应收金额</div>
          <div class="value">¥ 12,500,000</div>
        </div>
        <div class="fund-divider"></div>
        <div class="fund-metric-box received">
          <div class="label">实际已收</div>
          <div class="value highlight">¥ 9,500,000</div>
          <div class="sub-text">到账率 76%</div>
        </div>
        <div class="fund-divider"></div>
        <div class="fund-metric-box pending">
          <div class="label">待收金额</div>
          <div class="value">¥ 3,000,000</div>
        </div>
      </div>

      <!-- Middle Section: Payment Stages -->
      <div class="fund-stages">
        <div class="stage-header">
          <span>款项节点</span>
          <span>到账进度</span>
          <span>状态</span>
        </div>
        <div class="stage-list">
          <div v-for="(stage, idx) in fundStages" :key="idx" class="stage-item">
            <div class="stage-info">
              <span class="stage-name">{{ stage.name }}</span>
              <span class="stage-amount">应收: {{ stage.due }} / 实收: {{ stage.actual }}</span>
            </div>
            <div class="stage-progress">
              <el-progress 
                :percentage="stage.percent" 
                :status="stage.status === 'overdue' ? 'exception' : (stage.percent === 100 ? 'success' : '')"
                :stroke-width="8"
                :show-text="false"
              />
              <span class="progress-val">{{ stage.percent }}%</span>
            </div>
            <div class="stage-status">
              <span class="status-badge" :class="stage.status">
                {{ stage.statusText }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Overdue Alerts -->
      <div class="fund-alerts" v-if="overdueItems.length > 0">
        <div class="alert-title">
          <icon-attention theme="filled" size="14" fill="#ef4444" />
          <span>逾期风险提醒</span>
        </div>
        <div class="alert-list">
          <div v-for="(item, idx) in overdueItems" :key="idx" class="alert-item">
            <span class="alert-dot"></span>
            <span class="alert-text">
              <span class="alert-stage">{{ item.name }}</span>
              应收 <span class="alert-money">{{ item.due }}</span>，
              已逾期 <span class="alert-days">{{ item.days }}</span> 天，
              请尽快催收。
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Generic Line Chart for Other KPIs -->
    <div v-else ref="el" class="chart-box"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  selectedKpi: { type: String, default: null },
  isOverview: { type: Boolean, default: false },
  projectSeries: { type: Array, default: () => [] }
})
const emit = defineEmits(['stats-changed'])

// --- Fund Arrival Data Logic ---
const fundStages = ref([
  { name: '预付款 (30%)', due: '¥375w', actual: '¥375w', percent: 100, status: 'normal', statusText: '已结清' },
  { name: '进度款-1期 (20%)', due: '¥250w', actual: '¥250w', percent: 100, status: 'normal', statusText: '已结清' },
  { name: '进度款-2期 (20%)', due: '¥250w', actual: '¥250w', percent: 100, status: 'normal', statusText: '已结清' },
  { name: '进度款-3期 (20%)', due: '¥250w', actual: '¥75w', percent: 30, status: 'overdue', statusText: '逾期未付' },
  { name: '质保金 (10%)', due: '¥125w', actual: '¥0', percent: 0, status: 'pending', statusText: '未达节点' }
])

const overdueItems = computed(() => {
  return [
    { name: '进度款-3期', due: '¥175w', days: 15 }
  ]
})

// --- Existing Chart Logic ---
// 缓存 KPI 模式的示例数据，避免每次点击都重新生成
const mockCache = new Map()

const el = ref(null)
let chart = null
let resizeObserver = null

watch(() => [props.selectedKpi, props.isOverview, props.projectSeries], () => {
  if (props.selectedKpi !== '资金到账率') {
    setTimeout(() => render(), 0)
  }
}, { deep: true })

watch(() => props.selectedKpi, (v) => {
  if (v === '资金到账率') {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (chart) {
      chart.dispose()
      chart = null
    }
  }
})

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

/* Fund Dashboard Styles */
.fund-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 0 4px;
  overflow-y: auto;
}

/* Top Section */
.fund-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.fund-metric-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fund-metric-box .label {
  font-size: 12px;
  color: var(--muted);
}

.fund-metric-box .value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  font-family: 'Roboto Mono', monospace; /* Use monospaced for numbers if available */
}

.fund-metric-box .value.highlight {
  color: #3b82f6;
  font-size: 18px;
}

.fund-metric-box .sub-text {
  font-size: 11px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 1px 4px;
  border-radius: 4px;
  width: fit-content;
}

.fund-divider {
  width: 1px;
  height: 32px;
  background: #cbd5e1;
}

/* Middle Section: Stages */
.fund-stages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-header {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  font-size: 12px;
  color: var(--muted);
  padding: 0 4px;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-item {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 6px;
  transition: all 0.2s;
}

.stage-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.stage-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stage-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.stage-amount {
  font-size: 11px;
  color: var(--muted);
}

.stage-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-progress :deep(.el-progress) {
  flex: 1;
}

.progress-val {
  font-size: 12px;
  color: var(--muted);
  width: 32px;
  text-align: right;
}

.stage-status {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.status-badge.normal { background: #f0fdf4; color: #15803d; }
.status-badge.overdue { background: #fef2f2; color: #ef4444; }
.status-badge.pending { background: #f8fafc; color: #94a3b8; }

/* Bottom Section: Alerts */
.fund-alerts {
  margin-top: 4px;
  background: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 12px;
}

.alert-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #991b1b;
  margin-bottom: 6px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #7f1d1d;
  line-height: 1.4;
}

.alert-dot {
  width: 4px;
  height: 4px;
  background: #ef4444;
  border-radius: 50%;
  margin-top: 6px;
}

.alert-stage { font-weight: 600; }
.alert-money { font-weight: 700; font-family: 'Roboto Mono', monospace; }
.alert-days { font-weight: 700; text-decoration: underline; }

/* Generic Chart Box */
.chart-box {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>