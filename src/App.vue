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
            <span class="nav-item active">{{ selectedProject.name }}</span>
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
            <CompletionLine 
              :selected-kpi="selectedKpi" 
              :is-overview="isChartOverview"
              :project-series="selectedProject?.series"
            />
          </div>
          <!-- 根据是否选中 KPI 卡片来决定显示归因分析还是项目更新 -->
          <AttributionAnalysis 
            v-if="selectedKpi" 
            :selected-kpi="selectedKpi"
            class="updates-container"
          />
          <ProjectUpdates 
            v-else
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
import CompletionLine from './components/CompletionLine.vue'
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
  { name: '前海综合保税区车道', sector: '潘勇', series: generateSeriesData() },
  { name: '乌鲁木齐', sector: '潘勇', series: generateSeriesData() },
  { name: 'SSJS前海', sector: '潘勇', series: generateSeriesData() },
  { name: '国铁建-卡口', sector: '潘勇', series: generateSeriesData() },
  { name: '2前海-车道', sector: '潘勇', series: generateSeriesData() },
  { name: '临沂-机场', sector: '潘勇', series: generateSeriesData() },
  { name: '前海-综合', sector: '潘勇', series: generateSeriesData() },
  { name: '前海-维修', sector: '潘勇', series: generateSeriesData() },
  { name: 'SSKJ前海', sector: '潘勇', series: generateSeriesData() }
])
const kpis = ref([
  { title: '任务完成率', value: '76%', delta: '+3%', up: true },
  { title: '开工准点率', value: '78%', delta: '+2%', up: true },
  { title: '完工准点率', value: '81%', delta: '+1%', up: true },
  { title: '关键里程碑达成率', value: '72%', delta: '-3%', up: false },
  { title: '逾期任务率', value: '22%', delta: '-1%', up: true }
])

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
  color: var(--border);
}
</style>
