<template>
  <div id="app-wrapper">
    <header>
      <div class="brand">
        <span>项目管理系统</span>
        <span class="badge">数据看板</span>
      </div>
    </header>
    <main :class="['layout', { 'left-expanded': expandedLeft }]">
      <section class="col col-left">
        <WatchList
          :projects="projects"
          :search-query="searchQuery"
          :all-projects="filteredAllProjects"
          :active-project="selectedProject"
          :is-expanded="expandedLeft"
          @toggle-left="toggleLeftExpand"
          @update:searchQuery="searchQuery = $event"
          @toggle-watch-status="toggleWatchStatus"
          @search-active-change="handleSearchActiveChange"
          @select-project="handleSelectProject"
        />
        <RegularList 
          v-if="!isSearchActive" 
          v-model="regularCollapsed" 
          :regulars="regulars" 
          :active-project="selectedProject"
          :is-expanded="expandedLeft"
          @select-project="handleSelectProject"
        />
      </section>
      <section class="col col-middle">
        <!-- Navigation Breadcrumb -->
        <div class="nav-bar">
          <span 
            class="nav-item" 
            :class="{ 'link': !isCompanyView, 'all-active': isCompanyView }"
            @click="!isCompanyView ? showCompanyView() : null"
          >全部</span>
          <template v-if="!isCompanyView && selectedProject">
            <span class="nav-divider">/</span>
            <span 
              class="nav-item" 
              :class="{ 'link': selectedKpi, 'active': !selectedKpi }"
              @click="selectedKpi ? clearKpiSelection() : null"
            >{{ selectedProject.name }}</span>
            <template v-if="selectedKpi">
              <span class="nav-divider">/</span>
              <span class="nav-item active">{{ selectedKpi }}</span>
            </template>
          </template>
        </div>

        <!-- View Title Bar -->
        <div class="middle-header" v-if="!isCompanyView && selectedProject">
          <div class="project-info">
            <div class="project-main-title">{{ selectedProject.name }}</div>
            <div class="project-index-row">
              <div class="project-index-value">{{ lastValue(selectedProject).toFixed(2) }}</div>
              <div class="project-index-label">进度兑现指数</div>
              <div class="project-index-change" :class="deltaSign(selectedProject) >= 0 ? 'up' : 'down'">{{ deltaText(selectedProject) }}</div>
            </div>
          </div>
        </div>

        <!-- View Content -->
        <template v-if="!isCompanyView">
          <KpiGrid :kpis="kpis" :selected-kpi="selectedKpi" @select-kpi="handleSelectKpi" />
          <div class="chart-card-container">
            <KpiPanel 
              :selected-kpi="selectedKpi" 
              :is-overview="isChartOverview"
              :project-series="selectedProject?.series"
              @stats-changed="updateKpiFromChart"
            />
          </div>
          <!-- 根据是否选中 KPI 卡片来决定显示归因分析还是项目更新 -->
          <AttributionAnalysis 
            v-if="selectedKpi && selectedKpi !== '资金到账率' && selectedKpi !== '项目支出金额'" 
            :selected-kpi="selectedKpi"
            :metrics="kpiLiveMetrics"
            :compare-mode="kpiLiveCompareMode"
            class="updates-container"
          />
          <ProjectUpdates 
            v-else-if="!selectedKpi"
            class="updates-container" 
          />
        </template>
        <div v-else class="company-view-placeholder">
          <CompanyDashboard @select-project-name="selectProjectByName" />
        </div>
      </section>
      <ResearchChat 
        :is-company-view="isCompanyView"
        :current-project="selectedProject"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import WatchList from './components/WatchList.vue'
import RegularList from './components/RegularList.vue'
import KpiGrid from './components/KpiGrid.vue'
import KpiPanel from './components/KpiPanel.vue'
import ResearchChat from './components/ResearchChat.vue'
import ProjectUpdates from './components/ProjectUpdates.vue'
import AttributionAnalysis from './components/AttributionAnalysis.vue'
import CompanyDashboard from './components/CompanyDashboard.vue'

const expandedLeft = ref(false)
const regularCollapsed = ref(false)
function toggleLeftExpand(){ expandedLeft.value = !expandedLeft.value }

// --- Data State ---
const projects = ref([])
function generateSeriesData() {
  const data = [];
  let value = 60 + Math.random() * 20; // Initial start between 60-80
  for (let i = 0; i < 60; i++) {
    data.push(Math.round(value));
    // Significantly increased volatility: +/- 7.5 change per step
    value += (Math.random() - 0.5) * 15; 
    // Clamping
    if (value > 98) value = 98;
    if (value < 30) value = 30;
  }
  return data;
}
const regulars = ref([
  { name: '前海综合保税区车道', sector: '潘勇', series: generateSeriesData(), risks: [] },
  { 
    name: '乌鲁木齐', 
    sector: '潘勇', 
    series: generateSeriesData(),
    risks: [
      {
        level: 'high',
        levelText: '高风险',
        category: '供应商问题',
        reason: '第三方渠道接口变更，导致联调受阻',
        action: '协调渠道方技术负责人召开紧急会议',
        impact: '可能延期 5-7 天',
        deadline: '2025-11-30'
      },
      {
        level: 'medium',
        levelText: '中风险',
        category: '技术债务',
        reason: '历史代码耦合度高，重构工作量超预期',
        action: '安排专项重构时间，分阶段解耦',
        impact: '影响后续迭代速度',
        deadline: '2025-12-15'
      }
    ]
  },
  { 
    name: 'SSJS前海', 
    sector: '潘勇', 
    series: generateSeriesData(),
    risks: [
      {
        level: 'medium',
        levelText: '中风险',
        category: '资源缺口',
        reason: '核心开发人员请假，进度滞后 3 天',
        action: '从「报表组」临时抽调 1 名高级开发支援',
        impact: '部分功能延期交付',
        deadline: '2025-12-05'
      }
    ]
  },
  { name: '国铁建-卡口', sector: '潘勇', series: generateSeriesData(), risks: [] },
  { name: '2前海-车道', sector: '潘勇', series: generateSeriesData(), risks: [] },
  { 
    name: '临沂-机场', 
    sector: '潘勇', 
    series: generateSeriesData(),
    risks: [
      {
        level: 'medium',
        levelText: '中风险',
        category: '质量缺陷返工',
        reason: 'UI 验收反馈问题较多，修复耗时',
        action: '组织 UI 与前端坐班集中修复',
        impact: '测试周期延长 2 天',
        deadline: '2025-11-28'
      },
      {
        level: 'low',
        levelText: '低风险',
        category: '文档不足',
        reason: '部分接口文档更新不及时',
        action: '要求后端同步更新 API 文档',
        impact: '联调效率降低',
        deadline: '2025-12-01'
      }
    ]
  },
  { name: '前海-综合', sector: '潘勇', series: generateSeriesData(), risks: [] },
  { name: '前海-维修', sector: '潘勇', series: generateSeriesData(), risks: [] },
  { name: 'SSKJ前海', sector: '潘勇', series: generateSeriesData(), risks: [] }
])
const kpis = ref([
  { title: '资金到账率', value: '76%', delta: '+3%', up: true },
  { title: '任务完成率', value: '78%', delta: '+2%', up: true },
  { title: '项目支出金额', value: '81%', delta: '+1%', up: true },
  { title: '人员健康度', value: '72%', delta: '-3%', up: false },
  { title: '逾期任务率', value: '22%', delta: '-1%', up: true }
])

const kpiLiveMetrics = ref(null)
const kpiLiveCompareMode = ref('')

// --- View State ---
const isCompanyView = ref(true) // Show company view by default
const isChartOverview = ref(false) // Track if we are in project overview mode (enlarged sparkline)
const selectedProject = ref(null)
const selectedKpi = ref(null) // null when in overview mode, KPI title when in KPI mode

function handleSelectKpi(kpi) {
  // Toggle: if clicking already selected KPI, return to overview
  if (selectedKpi.value === kpi.title) {
    selectedKpi.value = null
    isChartOverview.value = true
  } else {
    selectedKpi.value = kpi.title
    isChartOverview.value = false // Switch to specific KPI view
  }
}

// --- Search and Filter Logic ---
const searchQuery = ref('')
const isSearchActive = ref(false)
const allProjects = computed(() => {
  const watched = projects.value.map(p => ({ ...p, isWatched: true }))
  const unWatched = regulars.value.map(p => ({ ...p, isWatched: false }))
  return [...watched, ...unWatched]
})
const filteredAllProjects = computed(() => {
  if (!searchQuery.value) return allProjects.value
  return allProjects.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
function handleSearchActiveChange(isActive) {
  isSearchActive.value = isActive
  if (!isActive) {
    searchQuery.value = ''
  }
}
function toggleWatchStatus(projectToToggle) {
  const indexInProjects = projects.value.findIndex(p => p.name === projectToToggle.name)
  if (indexInProjects !== -1) {
    const [removed] = projects.value.splice(indexInProjects, 1)
    regulars.value.unshift(removed)
  } else {
    const indexInRegulars = regulars.value.findIndex(p => p.name === projectToToggle.name)
    if (indexInRegulars !== -1) {
      const [added] = regulars.value.splice(indexInRegulars, 1)
      projects.value.push(added)
    }
  }
}

function selectProjectByName(name) {
  const p = projects.value.find(p => p.name === name) || regulars.value.find(p => p.name === name)
  if (p) {
    selectedProject.value = p
    isCompanyView.value = false
    isChartOverview.value = true
    selectedKpi.value = null
  }
}

function updateKpiFromChart(payload){
  if (!selectedKpi.value) return
  const idx = kpis.value.findIndex(k => k.title === selectedKpi.value)
  if (idx === -1) return
  // 项目支出金额：卡片显示实际支出金额，来源于图表数据
  if (selectedKpi.value === '项目支出金额') {
    const amt = Math.round(payload.amount || 0)
    const formatted = '¥ ' + new Intl.NumberFormat('en-US').format(amt)
    const updated = { ...kpis.value[idx], value: formatted }
    kpis.value.splice(idx, 1, updated)
    kpiLiveMetrics.value = { value: updated.value }
    kpiLiveCompareMode.value = ''
    return
  }

  const lastPct = Math.round((payload.last || 0) * 100)
  let up = payload.isUp
  let deltaPct = 0
  if (selectedKpi.value === '关键里程碑达成率' || selectedKpi.value === '任务完成率') {
    if (payload.planLast != null) {
      deltaPct = Math.abs(Math.round((payload.last - payload.planLast) * 100))
      up = (payload.last - payload.planLast) >= 0
    } else {
      deltaPct = Math.abs(Math.round((payload.last - (payload.prev || payload.last)) * 100))
      up = (payload.prev != null) ? (payload.last - payload.prev) >= 0 : up
    }
    kpiLiveCompareMode.value = '较计划'
  } else {
    deltaPct = Math.abs(Math.round((payload.last - (payload.prev || payload.last)) * 100))
    up = (payload.prev != null) ? (payload.last - payload.prev) >= 0 : up
    kpiLiveCompareMode.value = '环比'
  }
  const updated = { ...kpis.value[idx], value: lastPct + '%', delta: deltaPct + '%', up }
  kpis.value.splice(idx, 1, updated)
  kpiLiveMetrics.value = { value: updated.value, delta: updated.delta, up: updated.up }
}

// --- Selection and View Logic ---
onMounted(() => {
  // No project selected by default, showing company view
})
function handleSelectProject(project) {
  selectedProject.value = project
  isCompanyView.value = false // Switch to project view
  isChartOverview.value = true // Default to overview mode when project is selected
  selectedKpi.value = null // No KPI selected in overview mode (prevents highlight)
}
function showCompanyView() {
  isCompanyView.value = true
  selectedProject.value = null // Deselect project
  isChartOverview.value = false
}
function clearKpiSelection() {
  selectedKpi.value = null
  isChartOverview.value = true
}

// Helper functions
function lastValue(p){ if(!p || !p.series) return 0; const a=p.series; return a[a.length-1] }
function deltaSign(p){ if(!p || !p.series || p.series.length < 2) return 0; const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ if(!p || !p.series || p.series.length < 2) return ''; const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%'
}
</script>

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.layout {
  flex-grow: 1;
  overflow: hidden;
}
.middle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 8px;
}
.home-btn {
  height: 32px;
  width: 32px;
}
.project-info { display: flex; flex-direction: column; gap: 2px; padding: 0; }
.project-main-title { font-size: 20px; font-weight: 700; }
.project-index-row { display: flex; align-items: baseline; gap: 6px; }
.project-index-value { font-size: 22px; font-weight: 700; }
.project-index-label { font-size: 12px; color: var(--muted); }
.project-index-change { font-size: 12px; }
.project-index-change.up { color: var(--up); }
.project-index-change.down { color: var(--down); }

/* Breadcrumb Nav Styles */
.nav-bar {
  padding: 2px 0 2px 0;
  font-size: 13px;
  color: var(--muted);
  display: flex;
  align-items: center;
}
.nav-item {
  transition: color 0.2s;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.2;
}
.nav-item.link {
  cursor: pointer;
  color: var(--accent);
  font-weight: 600;
}
.nav-item.link:hover {
  color: var(--accent);
}
.nav-item.active {
  color: var(--text);
  font-weight: 500;
}
.nav-item.all-active {
  color: var(--text);
  font-weight: 600;
}
.nav-divider {
  margin: 0 8px;
  color: var(--muted);
}
</style>
