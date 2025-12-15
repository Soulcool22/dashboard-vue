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
        <div class="fixed-header-wrapper">
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

          <!-- Company View Header (Fixed) -->
          <div v-if="isCompanyView" class="company-header-group">
            <div class="dashboard-header">
              <div class="header-title">
                <span>项目态势总览</span>
              </div>
              <div class="header-meta">
                <span class="meta-item">统计周期：{{ statsPeriod || '暂无数据' }}</span>
                <span class="meta-divider">|</span>
                <span class="meta-item">更新于 {{ updatedAt || '暂无数据' }}</span>
              </div>
            </div>

            <div class="region-nav" style="margin-top: 12px;">
              <div 
                v-for="region in regions" 
                :key="region" 
                class="nav-pill" 
                :class="{ active: companyRegion === region }"
                @click="companyRegion = region"
              >
                {{ region }}
              </div>
            </div>
          </div>
        </div>

        <div class="scroll-content">
          <!-- View Content -->
          <template v-if="!isCompanyView">
            <KpiGrid :kpis="kpis" :selected-kpi="selectedKpi" @select-kpi="handleSelectKpi" />
            <div class="chart-card-container">
              <KpiPanel 
                :selected-kpi="selectedKpi" 
                :is-overview="isChartOverview"
                :project-series="selectedProject?.series"
                :project="selectedProject"
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
            <CompanyDashboard 
              :current-region="companyRegion"
              @select-project-name="selectProjectByName" 
            />
          </div>
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
import * as dataService from './services/dataService'

const expandedLeft = ref(false)
const regularCollapsed = ref(false)
function toggleLeftExpand(){ expandedLeft.value = !expandedLeft.value }

// --- Data State ---
const companyRegion = ref('全国')
const regions = ['全国', '华东', '华南', '华北', '西部', '广东', '海外']
const statsPeriod = ref('')
const updatedAt = ref('')
const projects = ref([])
function generateSeriesData() {
  return []
}
const regulars = ref([])
const kpis = ref([
  { title: '资金到账率', value: '0%', delta: '0%', up: true },
  { title: '任务完成率', value: '0%', delta: '0%', up: true },
  { title: '项目支出金额', value: '¥ 0', delta: '0', up: true },
  { title: '人员健康度', value: '0%', delta: '0%', up: true },
  { title: '逾期任务率', value: '0%', delta: '0%', up: true }
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

async function loadProjects() {
  const all = await dataService.getProjects()
  const watched = all.filter(p => p && p.isWatched)
  const unWatched = all.filter(p => p && !p.isWatched)
  projects.value = watched
  regulars.value = unWatched
}

async function loadKpis(projectId) {
  const list = await dataService.getKpis(projectId)
  if (Array.isArray(list)) {
    kpis.value = list
  }
}

async function loadProjectSeries(targetProject) {
  if (!targetProject) return
  const projectId = targetProject.id || targetProject.projectId || targetProject.name
  const series = await dataService.getProjectSeries(projectId)
  targetProject.series = Array.isArray(series) ? series : []
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
    String(item?.name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
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
    loadProjectSeries(p)
    loadKpis(p?.id || p?.projectId || p?.name)
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
  loadProjects()
  loadKpis()
})
async function handleSelectProject(project) {
  selectedProject.value = project
  isCompanyView.value = false // Switch to project view
  isChartOverview.value = true // Default to overview mode when project is selected
  selectedKpi.value = null // No KPI selected in overview mode (prevents highlight)
  await loadProjectSeries(project)
  await loadKpis(project?.id || project?.projectId || project?.name)
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
function lastValue(p){ if(!p || !p.series || p.series.length === 0) return 0; const a=p.series; return a[a.length-1] }
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
