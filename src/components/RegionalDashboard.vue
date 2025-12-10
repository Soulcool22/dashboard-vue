<template>
  <div class="regional-dashboard">
    <!-- Region Header Info -->
    <div class="insight-card full-width">
      <div class="insight-header">
        <span class="insight-title">区域态势</span>
      </div>
      <div class="insight-body">
        <div class="insight-text-row">
          <div class="insight-paragraph">
            {{ regionName }}整体进度<span class="text-highlight">优于全国平均</span>。
            重点项目「{{ regionName }}数据中心」已进入验收阶段。
            需关注<span class="text-highlight warning">人力资源缺口</span>，建议从其他大区调配 2 名后端开发支持。
          </div>
        </div>
        <div class="insight-metrics-row">
          <div class="mini-metric">
            <div class="mm-icon project">
              <span class="metric-val">8</span>
            </div>
            <div class="mm-content">
              <span class="mm-label">在建项目</span>
              <span class="mm-value">进行中</span>
            </div>
          </div>
          <div class="metric-divider"></div>
          <div class="mini-metric">
            <div class="mm-icon delivery">
              <span class="metric-val">6</span>
            </div>
            <div class="mm-content">
              <span class="mm-label">本月计划交付</span>
              <span class="mm-value">待完成</span>
            </div>
          </div>
          <div class="metric-divider"></div>
          <div class="mini-metric">
            <div class="mm-icon success">
              <span class="metric-val success">3</span>
            </div>
            <div class="mm-content">
              <span class="mm-label">本月已交付</span>
              <span class="mm-value success">50%</span>
            </div>
          </div>
          <div class="metric-divider"></div>
          <div class="mini-metric">
            <div class="mm-icon warning">
              <span class="metric-val warning">1</span>
            </div>
            <div class="mm-content">
              <span class="mm-label">风险项目</span>
              <span class="mm-value warning">需关注</span>
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
            <span class="progress-label">当前进度</span>
            <el-progress :percentage="project.progress" :status="project.status" :stroke-width="6" :show-text="false" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Project List & Resource Chart -->
    <div class="region-content">
      <!-- Left: Project List (The Core Focus) -->
      <div class="project-list-section">
        <div class="section-header">
          <span class="section-title">重点项目监控</span>
        </div>
        <div class="project-table">
          <div class="table-header">
            <span class="col-name">项目名称</span>
            <span class="col-status">状态</span>
            <span class="col-progress">进度</span>
            <span class="col-manager">负责人</span>
          </div>
          <div class="table-body">
            <div v-for="(project, idx) in projects" :key="idx" class="table-row">
              <span class="col-name">{{ project.name }}</span>
              <span class="col-status">
                <span class="status-dot" :class="project.status"></span>
                {{ project.statusText }}
              </span>
              <span class="col-progress">
                <el-progress :percentage="project.progress" :stroke-width="6" :show-text="false" :status="project.status === 'delay' ? 'exception' : ''" />
                <span class="progress-text">{{ project.progress }}%</span>
              </span>
              <span class="col-manager">{{ project.manager }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Resource/Trend Chart (Only 1 Chart) -->
      <div class="chart-section">
        <div class="section-header">
          <span class="section-title">区域资源负载</span>
        </div>
        <div class="chart-container" ref="chartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  regionName: {
    type: String,
    default: '华东'
  }
})

const chartRef = ref(null)
let myChart = null

const projects = ref([
  { name: '某市智慧交通一期', status: 'normal', statusText: '正常', progress: 85, manager: '张伟' },
  { name: '工业园区安防升级', status: 'delay', statusText: '延期', progress: 42, manager: '李娜' },
  { name: '政务云平台迁移', status: 'normal', statusText: '正常', progress: 68, manager: '王强' },
  { name: '轨道交通信号系统', status: 'risk', statusText: '风险', progress: 25, manager: '赵敏' },
  { name: '城市大脑指挥中心', status: 'normal', statusText: '正常', progress: 92, manager: '刘洋' },
])

const riskProjects = ref([
  {
    name: '工业园区安防升级',
    level: 'high',
    levelText: '高风险',
    category: '供应商问题',
    reason: '设备采购延迟，影响现场施工',
    action: '协调供应商加急发货，启动备用方案',
    progress: 42,
    status: 'exception'
  },
  {
    name: '轨道交通信号系统',
    level: 'medium',
    levelText: '中风险',
    category: '资源缺口',
    reason: '核心开发人员请假，进度滞后',
    action: '从其他项目组临时调配人员支援',
    progress: 25,
    status: 'warning'
  },
  {
    name: '政务云平台迁移',
    level: 'low',
    levelText: '低风险',
    category: '质量缺陷返工',
    reason: '测试环境不稳定，影响验收',
    action: '优化测试环境配置',
    progress: 68,
    status: ''
  }
])

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) myChart.dispose()
})

watch(() => props.regionName, () => {
  // In a real app, fetch new data here
  // For now, just re-render chart to simulate change
  if (myChart) {
    myChart.dispose()
    initChart()
  }
})

function handleResize() {
  myChart && myChart.resize()
}

function initChart() {
  if (!chartRef.value) return
  myChart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 30,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['前端', '后端', '测试', '产品', '运维'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '饱和度(%)',
      nameTextStyle: { color: '#94a3b8', fontSize: 10, padding: [0, 20, 0, 0] },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    series: [
      {
        name: '当前负载',
        type: 'bar',
        barWidth: 16,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#60a5fa' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: [85, 92, 78, 65, 88]
      },
      {
        name: '警戒线',
        type: 'line',
        symbol: 'none',
        lineStyle: { color: '#f56c6c', type: 'dashed', width: 1 },
        data: [90, 90, 90, 90, 90],
        tooltip: { show: false }
      }
    ]
  }
  myChart.setOption(option)
}
</script>

<style scoped>
.regional-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Insight Card (Same as CompanyDashboard) */
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

/* Metrics Row */
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

.mm-icon.project { background: #eff6ff; }
.mm-icon.delivery { background: #f0fdf4; }
.mm-icon.success { background: #f0fdf4; }
.mm-icon.warning { background: #fff7ed; }

.metric-val { font-weight: 700; color: #3b82f6; font-size: 14px; }
.metric-val.success { color: #15803d; }
.metric-val.warning { color: #e6a23c; }

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

.middle-section .section-header {
  margin-bottom: 0;
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
.risk-badge.low { background: #f0fdf4; color: #15803d; }

.risk-reason, .risk-action {
  font-size: 12px;
  line-height: 1.6;
  display: block;
}

.reason-label, .action-label { color: var(--muted); flex-shrink: 0; }
.reason-category { color: #3b82f6; font-weight: 600; margin: 0 4px; }
.reason-text, .action-text { color: var(--text); }

.risk-progress { margin-top: 4px; display: flex; align-items: center; gap: 8px; }
.risk-progress :deep(.el-progress) { flex: 1; min-width: 0; }
.progress-label { font-size: 11px; color: var(--muted); }

/* Content Section */
.region-content {
  display: grid;
  grid-template-columns: 1.6fr 1fr; /* More space for list */
  gap: 16px;
  height: 320px; /* Fixed height for consistency */
}

.project-list-section, .chart-section {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

/* Table Styles */
.project-table {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  flex: 1;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 4px;
  color: var(--muted);
  font-weight: 500;
  margin-bottom: 4px;
}

.table-body {
  overflow-y: auto;
  flex: 1;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
  padding: 10px 12px;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.col-name { font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.col-status { display: flex; align-items: center; gap: 6px; color: var(--text); }
.col-manager { color: var(--muted); text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-dot.normal { background: #15803d; }
.status-dot.delay { background: #dc2626; }
.status-dot.risk { background: #e6a23c; }

.col-progress { display: flex; align-items: center; gap: 8px; }
.col-progress :deep(.el-progress) { flex: 1; min-width: 0; }
.progress-text { min-width: 36px; text-align: right; color: var(--muted); font-size: 11px; }

/* Chart */
.chart-container {
  flex: 1;
  width: 100%;
  min-height: 0; /* Allow shrinking */
}
</style>
