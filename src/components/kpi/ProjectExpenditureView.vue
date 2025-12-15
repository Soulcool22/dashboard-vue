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

      <!-- 图表和列表并列区域 -->
      <div class="chart-breakdown-row">
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

      <!-- 重点支出事项追踪区域 -->
      <div class="top-ranking-section">
        <div class="section-header">
          <span class="section-title">
            <icon-ranking theme="outline" size="14" fill="#64748b" style="margin-right: 4px;"/>
            重点支出事项追踪
          </span>
        </div>
        <div class="ranking-list">
          <div v-for="(item, index) in weightedTopExpenditures" 
               :key="index" 
               class="expenditure-row"
               :style="{ '--row-weight-opacity': item.rowWeightOpacity }" >
            <!-- 极简序号 -->
            <div class="row-index">0{{ index + 1 }}</div>
            
            <!-- 事项主体 -->
            <div class="row-main">
              <div class="row-title-line">
                <span class="row-name">{{ item.name }}</span>
                <span class="row-tag">{{ item.category }}</span>
              </div>
              <div class="row-meta-line">
                <span class="row-date">{{ item.date }}</span>
                <span class="row-account">经办人：{{ item.handler || '系统自动' }}</span>
              </div>
            </div>

            <!-- 金额与权重 -->
            <div class="row-value-col">
              <div class="row-amount">
                <span class="currency">¥</span>
                {{ formatFullNumber(item.amount) }}
              </div>
              <div class="row-weight-info">
                <span>占当期 {{ item.percent }}%</span>
              </div>
            </div>

            <!-- 底部权重条 (Visual Weight Bar) -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { People as IconPeople, EngineeringBrand as IconEngineeringBrand, MoreApp as IconMoreApp, Ranking as IconRanking } from '@icon-park/vue-next'

const emit = defineEmits(['stats-changed'])
const chartRef = ref(null)
let chartInstance = null

// Mock Data for Top Expenditures
const topExpenditures = ref([])

// 为每行计算动态 CSS 变量 --row-weight-opacity
const weightedTopExpenditures = computed(() => {
  const maxAmount = Math.max(...topExpenditures.value.map(item => item.amount), 0)
  return topExpenditures.value.map(item => ({
    ...item,
    rowWeightOpacity: maxAmount > 0 ? (item.amount / maxAmount) * 0.1 : 0 // 最大金额对应0.1的透明度，递减
  }))
})

// 数据定义

// 数据定义
const totalBudget = ref(0)
const expenditurePeriods = ref([
  { month: '2025-06', personnel: 0, labor: 0, other: 0 },
  { month: '2025-07', personnel: 0, labor: 0, other: 0 },
  { month: '2025-08', personnel: 0, labor: 0, other: 0 },
  { month: '2025-09', personnel: 0, labor: 0, other: 0 },
  { month: '2025-10', personnel: 0, labor: 0, other: 0 },
  { month: '2025-11', personnel: 0, labor: 0, other: 0 }
])

// 计算属性
const totalExpenditure = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.personnel + p.labor + p.other, 0))
const remainingBudget = computed(() => totalBudget.value - totalExpenditure.value)
const budgetUtilization = computed(() => totalBudget.value > 0 ? Math.round((totalExpenditure.value / totalBudget.value) * 100) : 0)

const totalPersonnel = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.personnel, 0))
const totalLabor = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.labor, 0))
const totalOther = computed(() => expenditurePeriods.value.reduce((s, p) => s + p.other, 0))

const personnelPercent = computed(() => totalExpenditure.value > 0 ? Math.round((totalPersonnel.value / totalExpenditure.value) * 100) : 0)
const laborPercent = computed(() => totalExpenditure.value > 0 ? Math.round((totalLabor.value / totalExpenditure.value) * 100) : 0)
const otherPercent = computed(() => totalExpenditure.value > 0 ? Math.round((totalOther.value / totalExpenditure.value) * 100) : 0)

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
        name: '人员', type: 'bar', stack: 'total', data: pData, barWidth: '40%', barCategoryGap: '30%',
        itemStyle: { color: '#589ef8', borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '劳务', type: 'bar', stack: 'total', data: lData, barWidth: '50%',
        itemStyle: { color: '#34d399', borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '其他', type: 'bar', stack: 'total', data: oData, barWidth: '50%',
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

/* 图表和列表并列容器 */
.chart-breakdown-row {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-start;
}

/* 图表区域 */
.chart-wrapper {
  flex: 6;
  min-width: 0;
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
.breakdown-list { display: flex; flex-direction: column; gap: 8px; flex: 4; min-width: 0; }
.list-header { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 2px; }

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 6px;
  transition: all 0.2s;
}
.list-item:hover { border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }

.item-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-icon-box.personnel { background: rgba(88, 158, 248, 0.08); }
.item-icon-box.labor { background: rgba(52, 211, 153, 0.08); }
.item-icon-box.other { background: rgba(245, 158, 11, 0.08); }

.item-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.item-row-top { display: flex; justify-content: space-between; align-items: center; }
.item-name { font-size: 12px; font-weight: 600; color: var(--text); }
.item-amount { font-size: 12px; font-weight: 700; color: var(--text); font-family: sans-serif; }

.item-row-bottom { display: flex; align-items: center; gap: 8px; }
.progress-bg { flex: 1; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 2px; }
.progress-bar.personnel { background: #589ef8; }
.progress-bar.labor { background: #34d399; }
.progress-bar.other { background: #f59e0b; }
.item-percent { font-size: 11px; color: var(--muted); width: 28px; text-align: right; }

/* Top Ranking Section (New Professional Style) */
.top-ranking-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  border-radius: 8px;
  margin-top: 4px;
}

.top-ranking-section .section-header { margin-bottom: 2px; }
.section-subtitle { font-size: 11px; color: var(--muted); font-weight: 400; margin-left: 8px; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; }

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expenditure-row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 12px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
  /* 新增：基于权重动态背景 */
  background: linear-gradient(90deg, rgba(59, 130, 246, var(--row-weight-opacity, 0)) 0%, rgba(59, 130, 246, 0) 100%), #fff; /* 默认白色背景，叠加动态渐变 */
}

.expenditure-row:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, var(--row-weight-opacity, 0.05)) 0%, rgba(59, 130, 246, 0) 100%), #f8fafc; /* Hover时略微增强 */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border-color: #e2e8f0;
}

.expenditure-row:last-child {
  border-bottom: none;
}

/* 序号 */
.row-index {
  font-family: 'Roboto Mono', monospace; /* Technical font */
  font-size: 12px;
  color: #94a3b8;
  width: 24px;
  margin-right: 8px;
  opacity: 0.6;
}

/* 主体内容 */
.row-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* Text truncation */
}

.row-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-tag {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
}

.row-meta-line {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
}

/* 右侧数值 */
.row-value-col {
  text-align: right;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.row-amount {
  font-family: sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.3px;
}

.row-amount .currency {
  font-size: 11px;
  color: #94a3b8;
  margin-right: 2px;
}

.row-weight-info {
  font-size: 10px;
  color: var(--muted);
}

/* 底部权重条 */
</style>
