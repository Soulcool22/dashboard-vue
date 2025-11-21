<template>
  <div class="company-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-title">
        <icon-chart-line theme="filled" size="20" fill="#3b82f6" />
        <span>项目态势总览</span>
      </div>
      <div class="header-meta">
        <span class="meta-label">统计周期：</span>
        <span class="meta-value">2025 Q4 (10.01 - 12.31)</span>
        <span class="meta-divider">|</span>
        <span class="meta-label">更新时间：</span>
        <span class="meta-value">今日 14:30</span>
      </div>
    </div>

    <!-- Hero Section: Core Status & Insights -->
    <div class="hero-section">
      <!-- Left: Health Index -->
      <div class="health-card">
        <div class="health-chart">
          <div class="gauge-container" ref="gaugeRef"></div>
          <div class="health-score">
            <span class="score-value">82.5</span>
            <span class="score-label">健康指数</span>
          </div>
        </div>
        <div class="health-metrics">
          <div class="metric-item">
            <span class="m-label">在建项目</span>
            <span class="m-value">12</span>
          </div>
          <div class="metric-item">
            <span class="m-label">总进度</span>
            <span class="m-value">68%</span>
          </div>
          <div class="metric-item warning">
            <span class="m-label">风险预警</span>
            <span class="m-value">3</span>
          </div>
        </div>
      </div>

      <!-- Right: Executive Summary -->
      <div class="insight-card">
        <div class="card-header">
          <span class="card-title">
            <icon-brain theme="outline" size="18" :strokeWidth="3" />
            决策内参
          </span>
          <span class="insight-tag">AI 生成</span>
        </div>
        <div class="insight-content">
          <div class="insight-main">
            <icon-quote theme="filled" size="24" fill="#cbd5e1" class="quote-icon left" />
            <p class="insight-text">
              整体项目群运行<span class="highlight positive">平稳有序</span>，核心指标处于健康区间。
              但需重点关注 <span class="highlight negative">Q4 交付高峰</span> 带来的资源挤兑风险。
              建议立即启动 <span class="highlight warning">「支付网关」</span> 项目的专项攻坚，避免拖累整体里程碑。
            </p>
            <icon-quote theme="filled" size="24" fill="#cbd5e1" class="quote-icon right" />
          </div>
          <div class="insight-bullets">
            <div class="bullet-item">
              <icon-attention theme="filled" size="14" fill="#e6a23c" />
              <span>资源饱和度已达 92%，建议暂停非关键性需求变更。</span>
            </div>
            <div class="bullet-item">
              <icon-trend-two theme="filled" size="14" fill="#15803d" />
              <span>自动化测试覆盖率提升至 75%，返工率环比下降 12%。</span>
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
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
.header-meta {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta-value {
  color: var(--text);
  font-weight: 500;
}
.meta-divider {
  color: var(--border);
  margin: 0 4px;
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  height: 180px;
}

.health-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.health-chart {
  position: relative;
  width: 160px;
  height: 80px; /* Half circle height */
  margin-bottom: 10px;
}
.gauge-container {
  width: 100%;
  height: 100%;
}
.health-score {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.score-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}
.score-label {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

.health-metrics {
  width: 100%;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.m-label { font-size: 11px; color: var(--muted); }
.m-value { font-size: 14px; font-weight: 600; color: var(--text); }
.metric-item.warning .m-value { color: #e6a23c; }

.insight-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.insight-tag {
  font-size: 10px;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.insight-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.insight-main {
  position: relative;
  padding: 0 24px;
}
.quote-icon {
  position: absolute;
  opacity: 0.3;
}
.quote-icon.left { top: -8px; left: -4px; }
.quote-icon.right { bottom: -8px; right: -4px; }

.insight-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  text-align: justify;
  margin: 0;
}
.highlight {
  font-weight: 600;
  padding: 0 2px;
}
.highlight.positive { color: #15803d; }
.highlight.negative { color: #dc2626; }
.highlight.warning { color: #e6a23c; }

.insight-bullets {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}
.bullet-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

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
