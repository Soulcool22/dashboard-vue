<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>项目支出分析</h3>
    </div>
    <div class="expenditure-container">
      <div class="fund-overview">
        <div class="fund-metric-box total">
          <div class="label">总预算</div>
          <div class="value"><span class="currency">¥</span><span class="amount">{{ formatFullNumber(totalBudget) }}</span></div>
        </div>
        <div class="fund-divider"></div>
        <div class="fund-metric-box received">
          <div class="label">累计支出</div>
          <div class="value highlight"><span class="currency">¥</span><span class="amount">{{ formatFullNumber(totalExpenditure) }}</span></div>
          <div class="sub-text">执行率 {{ budgetUtilization }}%</div>
        </div>
        <div class="fund-divider"></div>
        <div class="fund-metric-box pending">
          <div class="label">剩余预算</div>
          <div class="value"><span class="currency">¥</span><span class="amount">{{ formatFullNumber(remainingBudget) }}</span></div>
        </div>
      </div>

      <!-- ECharts 图表区域 -->
      <div class="chart-wrapper">
        <div class="section-header">
          <span class="section-title">月度支出趋势</span>
          <div class="chart-legend">
            <span class="legend-item"><span class="dot personnel"></span>人员</span>
            <span class="legend-item"><span class="dot labor"></span>劳务</span>
            <span class="legend-item"><span class="dot other"></span>其他</span>
          </div>
        </div>
        <div ref="chartRef" class="expenditure-chart"></div>
      </div>

      <!-- 分类详情列表 -->
      <div class="breakdown-list">
        <div class="list-header">
          <span>支出构成</span>
          <span>占比详情</span>
        </div>
        
        <div class="list-item">
          <div class="item-icon-box personnel">
            <icon-people theme="outline" size="16" fill="#589ef8" :strokeWidth="3" />
          </div>
          <div class="item-content">
            <div class="item-row-top">
              <span class="item-name">人员报销</span>
              <span class="item-amount">¥{{ formatAmount(totalPersonnel) }}万</span>
            </div>
            <div class="item-row-bottom">
              <div class="progress-bg">
                <div class="progress-bar personnel" :style="{ width: personnelPercent + '%' }"></div>
              </div>
              <span class="item-percent">{{ personnelPercent }}%</span>
            </div>
          </div>
        </div>

        <div class="list-item">
          <div class="item-icon-box labor">
            <icon-engineering-brand theme="outline" size="16" fill="#34d399" :strokeWidth="3" />
          </div>
          <div class="item-content">
            <div class="item-row-top">
              <span class="item-name">劳务支出</span>
              <span class="item-amount">¥{{ formatAmount(totalLabor) }}万</span>
            </div>
            <div class="item-row-bottom">
              <div class="progress-bg">
                <div class="progress-bar labor" :style="{ width: laborPercent + '%' }"></div>
              </div>
              <span class="item-percent">{{ laborPercent }}%</span>
            </div>
          </div>
        </div>

        <div class="list-item">
          <div class="item-icon-box other">
            <icon-more-app theme="outline" size="16" fill="#a78bfa" :strokeWidth="3" />
          </div>
          <div class="item-content">
            <div class="item-row-top">
              <span class="item-name">其他支出</span>
              <span class="item-amount">¥{{ formatAmount(totalOther) }}万</span>
            </div>
            <div class="item-row-bottom">
              <div class="progress-bg">
                <div class="progress-bar other" :style="{ width: otherPercent + '%' }"></div>
              </div>
              <span class="item-percent">{{ otherPercent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const emit = defineEmits(['stats-changed'])
const chartRef = ref(null)
let chartInstance = null

// 数据定义
const totalBudget = ref(12500000)
const expenditurePeriods = ref([
  { month: '2025-06', personnel: 780000, labor: 390000, other: 85000 },
  { month: '2025-07', personnel: 810000, labor: 420000, other: 95000 },
  { month: '2025-08', personnel: 850000, labor: 450000, other: 120000 },
  { month: '2025-09', personnel: 780000, labor: 410000, other: 110000 },
  { month: '2025-10', personnel: 920000, labor: 480000, other: 95000 },
  { month: '2025-11', personnel: 870000, labor: 460000, other: 105000 }
])

// 计算属性
const totalExpenditure = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.personnel + p.labor + p.other, 0))
const remainingBudget = computed(() => totalBudget.value - totalExpenditure.value)
const budgetUtilization = computed(() => Math.round((totalExpenditure.value / totalBudget.value) * 100))

const totalPersonnel = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.personnel, 0))
const totalLabor = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.labor, 0))
const totalOther = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.other, 0))

const personnelPercent = computed(() => Math.round((totalPersonnel.value / totalExpenditure.value) * 100))
const laborPercent = computed(() => Math.round((totalLabor.value / totalExpenditure.value) * 100))
const otherPercent = computed(() => Math.round((totalOther.value / totalExpenditure.value) * 100))

function formatAmount(amount) {
  return (amount / 10000).toFixed(1)
}

function formatFullNumber(num) {
  return num.toLocaleString('en-US')
}

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)

  const months = expenditurePeriods.value.map(p => parseInt(p.month.substring(5)) + '月')
  const pData = expenditurePeriods.value.map(p => (p.personnel / 10000).toFixed(1))
  const lData = expenditurePeriods.value.map(p => (p.labor / 10000).toFixed(1))
  const oData = expenditurePeriods.value.map(p => (p.other / 10000).toFixed(1))

  const option = {
    grid: { left: 40, right: 10, top: 20, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e6e9f0',
      textStyle: { color: '#2f3b52', fontSize: 12, fontFamily: 'sans-serif' },
      axisPointer: { type: 'line', lineStyle: { color: '#e6e9f0', width: 1, type: 'dashed' } }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: '#8a94a6', fontSize: 11, fontFamily: 'sans-serif' },
      axisLine: { lineStyle: { color: '#e6e9f0' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#8a94a6', fontSize: 11, fontFamily: 'sans-serif' }
    },
    series: [
      {
        name: '人员', type: 'bar', stack: 'total', data: pData, barWidth: 20,
        itemStyle: { color: '#589ef8', borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '劳务', type: 'bar', stack: 'total', data: lData, barWidth: 20,
        itemStyle: { color: '#34d399', borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '其他', type: 'bar', stack: 'total', data: oData, barWidth: 20,
        itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(async () => {
  const last = budgetUtilization.value / 100
  const amount = totalExpenditure.value
  emit('stats-changed', { last, prev: 0.68, isUp: true, isOverview: false, kpi: '项目支出金额', amount })
  await nextTick()
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})
</script>

<style scoped>
.card-header { margin-bottom: 12px; }
.card-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }

.expenditure-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  padding: 0 4px;
  overflow-y: auto;
}

/* 顶部概览复制资金到账率风格 */
.fund-overview { display: flex; align-items: center; justify-content: space-evenly; gap: 0; background: #f8fafc; padding: 12px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
.fund-metric-box { display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; flex: 1; }
.fund-metric-box .label { font-size: 12px; color: var(--muted); }
.fund-metric-box .value { font-size: 18px; font-weight: 700; color: var(--text); font-family: sans-serif; font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; line-height: 1.1; display: inline-flex; align-items: center; gap: 8px; }
.fund-metric-box .value .currency { font-size: 0.9em; color: var(--muted); margin-right: 4px; }
.fund-metric-box .value .amount { letter-spacing: 0.2px; }
.fund-metric-box .value.highlight { color: #3b82f6; }
.fund-metric-box .sub-text { font-size: 11px; color: #3b82f6; background: #eff6ff; padding: 1px 6px; border-radius: 4px; width: fit-content; margin-left: 2px; line-height: 1.2; }
.fund-divider { width: 1px; height: 32px; background: #cbd5e1; margin: 0 12px; }

/* 图表区域 */
.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-title { font-size: 13px; font-weight: 600; color: var(--text); }
.chart-legend { display: flex; gap: 12px; font-size: 11px; color: var(--muted); }
.legend-item { display: flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 2px; }
.dot.personnel { background: #589ef8; }
.dot.labor { background: #34d399; }
.dot.other { background: #f59e0b; }

.expenditure-chart { width: 100%; height: 180px; }

/* 列表区域 */
.breakdown-list { display: flex; flex-direction: column; gap: 12px; }
.list-header { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 4px; }

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  transition: all 0.2s;
}
.list-item:hover { border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }

.item-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-icon-box.personnel { background: rgba(88, 158, 248, 0.08); }
.item-icon-box.labor { background: rgba(52, 211, 153, 0.08); }
.item-icon-box.other { background: rgba(245, 158, 11, 0.08); }

.item-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.item-row-top { display: flex; justify-content: space-between; align-items: center; }
.item-name { font-size: 13px; font-weight: 600; color: var(--text); }
.item-amount { font-size: 13px; font-weight: 700; color: var(--text); font-family: sans-serif; }

.item-row-bottom { display: flex; align-items: center; gap: 8px; }
.progress-bg { flex: 1; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 2px; }
.progress-bar.personnel { background: #589ef8; }
.progress-bar.labor { background: #34d399; }
.progress-bar.other { background: #f59e0b; }
.item-percent { font-size: 11px; color: var(--muted); width: 28px; text-align: right; }
</style>
