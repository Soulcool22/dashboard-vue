<template>
  <div class="regional-dashboard">
    <!-- Region Header Info -->
    <div class="region-hero">
      <div class="region-kpi-row">
        <div class="kpi-card">
          <span class="kpi-label">在建项目</span>
          <span class="kpi-value">8</span>
        </div>
        <div class="kpi-divider"></div>
        <div class="kpi-card">
          <span class="kpi-label">本月计划交付</span>
          <span class="kpi-value">6</span>
        </div>
        <div class="kpi-divider"></div>
        <div class="kpi-card">
          <span class="kpi-label">本月已交付</span>
          <span class="kpi-value">3</span>
        </div>
        <div class="kpi-divider"></div>
        <div class="kpi-card warning">
          <span class="kpi-label">风险项目</span>
          <span class="kpi-value">1</span>
        </div>
      </div>
      
      <div class="region-insight">
        <div class="insight-title">区域态势</div>
        <p class="insight-text">
          {{ regionName }}整体进度<span class="highlight positive">优于全国平均</span>。
          重点项目「{{ regionName }}数据中心」已进入验收阶段。
          需关注<span class="highlight warning">人力资源缺口</span>，建议从其他大区调配 2 名后端开发支持。
        </p>
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

/* Hero Section */
.region-hero {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.region-kpi-row {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribute evenly */
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.kpi-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.kpi-label {
  font-size: 13px;
  color: var(--muted);
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  font-family: 'Roboto', sans-serif;
}

.kpi-card.warning .kpi-value { color: #e6a23c; }

.kpi-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
}

.region-insight {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.insight-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.insight-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
  margin: 0;
}

.highlight { font-weight: 600; padding: 0 2px; }
.highlight.positive { color: #15803d; }
.highlight.warning { color: #e6a23c; }

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
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
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
