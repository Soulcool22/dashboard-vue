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

    <!-- Region Navigation -->
    <div class="region-nav">
      <div 
        v-for="region in regions" 
        :key="region" 
        class="nav-pill" 
        :class="{ active: currentRegion === region }"
        @click="currentRegion = region"
      >
        {{ region }}
      </div>
    </div>

    <!-- National View Content -->
    <template v-if="currentRegion === '全国'">
      <!-- Hero Section: Core Status & Insights (Refactored) -->
      <div class="hero-section national-hero">
        <!-- Full Width Executive Summary -->
        <div class="insight-card full-width">
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
                <div class="mm-icon health">
                  <span class="health-val">82.5</span>
                </div>
                <div class="mm-content">
                  <span class="mm-label">健康指数</span>
                  <span class="mm-value">稳健</span>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="mini-metric">
                <div class="mm-icon resource">
                  <icon-people theme="filled" size="16" fill="#e6a23c" />
                </div>
                <div class="mm-content">
                  <span class="mm-label">资源饱和度</span>
                  <span class="mm-value warning">92%</span>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="mini-metric">
                <div class="mm-icon quality">
                  <icon-check-one theme="filled" size="16" fill="#15803d" />
                </div>
                <div class="mm-content">
                  <span class="mm-label">自动化覆盖</span>
                  <span class="mm-value success">75%</span>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="mini-metric">
                <div class="mm-icon efficiency">
                  <icon-lightning theme="filled" size="16" fill="#3b82f6" />
                </div>
                <div class="mm-content">
                  <span class="mm-label">交付效率</span>
                  <span class="mm-value">高</span>
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
              <span class="reason-category">{{ project.category }}</span>
              <span class="reason-text">{{ project.reason }}</span>
            </div>
            <div class="risk-action">
              <span class="action-label">建议行动：</span>
              <span class="action-text">{{ project.action }}</span>
            </div>
            <div class="risk-progress">
              <el-progress :percentage="project.progress" :status="project.status" :stroke-width="6" :show-text="false" />
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
    </template>

    <!-- Regional View Content -->
    <RegionalDashboard v-else :region-name="currentRegion" />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import RegionalDashboard from './RegionalDashboard.vue'

const currentRegion = ref('全国')
const regions = ['全国', '华东', '华南', '华北', '西部', '广东', '海外']

const trendChartRef = ref(null)
let trendChart = null

const riskProjects = ref([
  {
    name: '支付网关升级',
    level: 'high',
    levelText: '高风险',
    category: '供应商问题',
    reason: '第三方渠道接口变更，导致联调受阻',
    action: '协调渠道方技术负责人召开紧急会议',
    progress: 45,
    status: 'exception'
  },
  {
    name: 'CRM 系统重构',
    level: 'medium',
    levelText: '中风险',
    category: '资源缺口',
    reason: '核心开发人员请假，进度滞后 3 天',
    action: '从「报表组」临时抽调 1 名高级开发支援',
    progress: 72,
    status: 'warning'
  },
  {
    name: '移动端 V3.0',
    level: 'medium',
    levelText: '中风险',
    category: '质量缺陷返工',
    reason: 'UI 验收反馈问题较多，修复耗时',
    action: '组织 UI 与前端坐班集中修复',
    progress: 88,
    status: 'warning'
  }
])

// Watch for region changes to re-init charts if returning to National view
watch(currentRegion, (newVal) => {
  if (newVal === '全国') {
    nextTick(() => {
      initTrendChart()
    })
  }
})

onMounted(() => {
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChart) trendChart.dispose()
})

function handleResize() {
  trendChart && trendChart.resize()
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
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--muted);
}

.meta-divider { color: var(--border); }

/* Region Navigation */
.region-nav {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
}

.nav-pill {
  padding: 6px 16px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-pill:hover {
  background: #e2e8f0;
  color: var(--text);
}

.nav-pill.active {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
}

/* Hero Section */
.hero-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Insight Card (Refactored for Full Width) */
.insight-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.insight-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 14px;
  background: #3b82f6;
  border-radius: 2px;
}

.insight-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-text-row {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
}

.insight-paragraph {
  margin: 0;
}

.text-highlight {
  font-weight: 600;
  background: #f1f5f9;
  padding: 0 4px;
  border-radius: 4px;
  color: var(--text);
}

.text-highlight.warning {
  background: #fff7ed;
  color: #c2410c;
}

/* Metrics Row in Insight Card */
.insight-metrics-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.mini-metric {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mm-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.mm-icon.health { background: #eff6ff; }
.health-val { font-weight: 700; color: #3b82f6; font-size: 13px; }

.mm-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mm-label { font-size: 11px; color: var(--muted); }
.mm-value { font-size: 13px; font-weight: 600; color: var(--text); }
.mm-value.warning { color: #e6a23c; }
.mm-value.success { color: #15803d; }

.metric-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

/* Middle Section: Risk Focus */
.middle-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
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
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.risk-badge.high { background: #fef2f2; color: #ef4444; }
.risk-badge.medium { background: #fff7ed; color: #f97316; }

.risk-reason, .risk-action {
  font-size: 12px;
  line-height: 1.6;
  display: block;
}

.reason-label, .action-label { color: var(--muted); flex-shrink: 0; }
.reason-category { color: #3b82f6; font-weight: 600; margin: 0 4px; }
.reason-text, .action-text { color: var(--text); }

.risk-progress { margin-top: 4px; }

/* Bottom Section: Trends */
.bottom-section {
  display: flex;
  flex-direction: column;
}

.chart-wrapper {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  height: 240px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item.plan .dot { background: #cbd5e1; }
.legend-item.actual .dot { background: #3b82f6; }

.trend-chart {
  flex: 1;
  width: 100%;
}
</style>
