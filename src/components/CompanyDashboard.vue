<template>
  <div class="company-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-title">
        <span>项目态势总览</span>
      </div>
      <div class="header-meta">
        <span class="meta-item">统计周期：2025 Q4</span>
        <span class="meta-divider">|</span>
        <span class="meta-item">更新于 14:30</span>
      </div>
    </div>

    <!-- Hero Section: Core Status & Insights -->
    <div class="hero-section">
      <!-- Left: Health Index -->
      <div class="health-card">
        <div class="health-main">
          <div class="gauge-wrapper">
            <div class="gauge-container" ref="gaugeRef"></div>
            <div class="health-score-overlay">
              <span class="score-val">82.5</span>
              <span class="score-lbl">健康指数</span>
            </div>
          </div>
        </div>
        <div class="health-stats">
          <div class="stat-box">
            <span class="stat-val">12</span>
            <span class="stat-lbl">在建项目</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <span class="stat-val">68%</span>
            <span class="stat-lbl">总进度</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box warning">
            <span class="stat-val">3</span>
            <span class="stat-lbl">风险预警</span>
          </div>
        </div>
      </div>

      <!-- Right: Executive Summary -->
      <div class="insight-card">
        <div class="insight-header">
          <span class="insight-title">管理视点</span>
        </div>
        <div class="insight-body">
          <div class="insight-text-row">
            <div class="insight-paragraph">
              整体项目群运行<span class="text-highlight">平稳有序</span>，核心指标处于健康区间。但需重点关注 <span class="text-highlight warning">Q4 交付高峰</span> 带来的资源挤兑风险。建议立即启动「支付网关」项目的专项攻坚。
            </div>
          </div>
          <div class="insight-metrics-row">
            <div class="mini-metric">
              <div class="mm-icon resource">
                <icon-people theme="filled" size="16" fill="#e6a23c" />
              </div>
              <div class="mm-content">
                <span class="mm-label">资源饱和度</span>
                <span class="mm-value warning">92%</span>
              </div>
            </div>
            <div class="mini-metric">
              <div class="mm-icon quality">
                <icon-check-one theme="filled" size="16" fill="#15803d" />
              </div>
              <div class="mm-content">
                <span class="mm-label">自动化覆盖</span>
                <span class="mm-value success">75%</span>
              </div>
            </div>
            <div class="mini-metric">
              <div class="mm-icon efficiency">
                <icon-lightning theme="filled" size="16" fill="#3b82f6" />
              </div>
              <div class="mm-content">
                <span class="mm-label">交付效率</span>
                <span class="mm-value">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Section: Risk Focus -->
    <div class="middle-section">
      <div class="section-header">
        <span class="section-title">重点关注 (Top 3)</span>
        <span class="section-subtitle">需管理层介入协调的项目</span>
      </div>
      <div class="risk-grid">
        <div class="risk-card" v-for="(project, idx) in riskProjects" :key="idx">
          <div class="risk-header">
            <span class="risk-name">{{ project.name }}</span>
            <span class="risk-badge" :class="project.level">{{ project.levelText }}</span>
          </div>
          <div class="risk-reason">
            <span class="reason-label">风险归因：</span>
            <span class="reason-text">{{ project.reason }}</span>
          </div>
          <div class="risk-action">
            <span class="action-label">建议行动：</span>
            <span class="action-text">{{ project.action }}</span>
          </div>
          <div class="risk-progress">
            <el-progress :percentage="project.progress" :status="project.status" :stroke-width="6" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Trends -->
    <div class="bottom-section">
      <div class="chart-wrapper">
        <div class="chart-header">
          <span class="chart-title">项目群交付趋势 (近6个月)</span>
          <div class="chart-legend">
            <span class="legend-item plan"><span class="dot"></span>计划交付</span>
            <span class="legend-item actual"><span class="dot"></span>实际交付</span>
          </div>
        </div>
        <div class="trend-chart" ref="trendChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const gaugeRef = ref(null)
const trendChartRef = ref(null)
let gaugeChart = null
let trendChart = null

const riskProjects = ref([
  {
    name: '支付网关升级',
    level: 'high',
    levelText: '高风险',
    reason: '第三方渠道接口变更，导致联调受阻',
    action: '协调渠道方技术负责人召开紧急会议',
    progress: 45,
    status: 'exception'
  },
  {
    name: 'CRM 系统重构',
    level: 'medium',
    levelText: '中风险',
    reason: '核心开发人员请假，进度滞后 3 天',
    action: '从「报表组」临时抽调 1 名高级开发支援',
    progress: 72,
    status: 'warning'
  },
  {
    name: '移动端 V3.0',
    level: 'medium',
    levelText: '中风险',
    reason: 'UI 验收反馈问题较多，修复耗时',
    action: '组织 UI 与前端坐班集中修复',
    progress: 88,
    status: 'warning'
  }
])

onMounted(() => {
  initGauge()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (gaugeChart) gaugeChart.dispose()
  if (trendChart) trendChart.dispose()
})

function handleResize() {
  gaugeChart && gaugeChart.resize()
  trendChart && trendChart.resize()
}

function initGauge() {
  if (!gaugeRef.value) return
  gaugeChart = echarts.init(gaugeRef.value)
  
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '100%',
        center: ['50%', '75%'], // Semi-circle layout
        itemStyle: {
          color: '#3b82f6',
          shadowColor: 'rgba(0,138,255,0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        progress: {
          show: true,
          roundCap: true,
          width: 12
        },
        pointer: {
          show: false
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 12,
            color: [[1, '#e2e8f0']] // Background color
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: { show: false },
        data: [{ value: 82.5 }]
      }
    ]
  }
  gaugeChart.setOption(option)
}

function initTrendChart() {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    grid: {
      top: 30,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' }
    },
    xAxis: {
      type: 'category',
      data: ['6月', '7月', '8月', '9月', '10月', '11月'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e2e8f0' }
      },
      axisLabel: { color: '#64748b' }
    },
    series: [
      {
        name: '计划交付',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [12, 15, 18, 22, 25, 28],
        lineStyle: { color: '#94a3b8', width: 2, type: 'dashed' },
        itemStyle: { color: '#94a3b8' }
      },
      {
        name: '实际交付',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        data: [11, 16, 17, 24, 23, 29],
        lineStyle: { color: '#3b82f6', width: 3 },
        itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
          ])
        }
      }
    ]
  }
  trendChart.setOption(option)
}
</script>

<style scoped>
.company-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Removed height: 100% and overflow-y: auto to let parent handle scrolling */
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-top: -4px; /* Slight pull up */
}
.header-title {
  font-size: 24px; /* Increased size */
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.header-meta {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
}
.meta-value {
  font-weight: 500;
  color: var(--text);
}
.meta-divider {
  color: var(--border);
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  height: 160px;
}

/* Health Card - Refined */
.health-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.health-main {
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
}

.gauge-wrapper {
  position: relative;
  width: 140px;
  height: 70px;
}

.gauge-container {
  width: 100%;
  height: 100%;
}

.health-score-overlay {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-val {
  font-size: 26px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  font-family: 'Roboto', sans-serif; /* More technical font if available */
}

.score-lbl {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}

.health-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid var(--border);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.stat-lbl {
  font-size: 10px;
  color: var(--muted);
}

.stat-box.warning .stat-val { color: #e6a23c; }

.stat-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
}

/* Insight Card - Professional */
.insight-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
}

.insight-header {
  margin-bottom: 10px;
}

.insight-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.insight-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.insight-text-row {
  margin-bottom: 12px;
}

.insight-paragraph {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  text-align: justify;
}

.text-highlight {
  font-weight: 600;
  color: var(--text);
  background: linear-gradient(120deg, rgba(88, 158, 248, 0.15) 0%, rgba(88, 158, 248, 0) 100%);
  padding: 0 4px;
  border-radius: 2px;
}

.text-highlight.warning {
  background: linear-gradient(120deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0) 100%);
  color: #b45309;
}

.insight-metrics-row {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.mini-metric {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mm-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mm-icon.resource { background: rgba(230, 162, 60, 0.1); }
.mm-icon.quality { background: rgba(21, 128, 61, 0.1); }
.mm-icon.efficiency { background: rgba(59, 130, 246, 0.1); }

.mm-content {
  display: flex;
  flex-direction: column;
}

.mm-label {
  font-size: 10px;
  color: var(--muted);
}

.mm-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.mm-value.warning { color: #e6a23c; }
.mm-value.success { color: #15803d; }

/* Middle Section */
.middle-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.section-subtitle {
  font-size: 12px;
  color: var(--muted);
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.risk-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.risk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.risk-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.risk-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
}
.risk-badge.high { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.risk-badge.medium { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

.risk-reason, .risk-action {
  font-size: 11px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.reason-label, .action-label { color: var(--muted); }
.reason-text { color: var(--text); }
.action-text { color: #3b82f6; }

.risk-progress {
  margin-top: 4px;
}

/* Bottom Section */
.bottom-section {
  flex: 1;
  min-height: 200px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.chart-legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--muted);
}
.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.legend-item.plan .dot { background: #94a3b8; }
.legend-item.actual .dot { background: #3b82f6; }

.trend-chart {
  flex: 1;
  width: 100%;
  min-height: 180px;
}
</style>
