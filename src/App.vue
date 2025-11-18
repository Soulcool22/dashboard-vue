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
        <!-- View Title Bar -->
        <div class="middle-header">
          <div v-if="!isCompanyView && selectedProject" class="project-info">
            <div class="project-main-title">{{ selectedProject.name }}</div>
            <div class="project-index-row">
              <div class="project-index-value">{{ lastValue(selectedProject).toFixed(2) }}</div>
              <div class="project-index-label">进度兑现指数</div>
              <div class="project-index-change" :class="deltaSign(selectedProject) >= 0 ? 'up' : 'down'">{{ deltaText(selectedProject) }}</div>
            </div>
          </div>
          <div v-else class="project-info">
            <div class="project-main-title">公司运营总览</div>
          </div>
          <el-button v-if="!isCompanyView" @click="showCompanyView" class="home-btn" text>
            <home theme="outline" size="22" fill="#999595" :strokeWidth="3" strokeLinejoin="bevel"/>
          </el-button>
        </div>

        <!-- View Content -->
        <template v-if="!isCompanyView">
          <KpiGrid :kpis="kpis" />
          <div class="chart-card-container">
            <CompletionLine />
          </div>
          <ProjectUpdates class="updates-container" />
        </template>
        <div v-else class="company-view-placeholder">
          <!-- Company-level content will go here -->
        </div>
      </section>
      <ResearchChat />
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
import { Home } from '@icon-park/vue-next'

const expandedLeft = ref(true)
const regularCollapsed = ref(false)
function toggleLeftExpand(){ expandedLeft.value = !expandedLeft.value }

// --- Data State ---
const projects = ref([])
function generateSeriesData() {
  const data = [];
  let value = 70 + Math.random() * 15;
  for (let i = 0; i < 16; i++) {
    data.push(Math.round(value));
    value += (Math.random() - 0.5) * 5;
    if (value > 95) value = 95;
    if (value < 55) value = 55;
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
const selectedProject = ref(null)

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

// --- Selection and View Logic ---
onMounted(() => {
  // No project selected by default, showing company view
})
function handleSelectProject(project) {
  selectedProject.value = project
  isCompanyView.value = false // Switch to project view
}
function showCompanyView() {
  isCompanyView.value = true
  selectedProject.value = null // Deselect project
}

// Helper functions
function lastValue(p){ if(!p || !p.series) return 0; const a=p.series; return a[a.length-1] }
function deltaSign(p){ if(!p || !p.series || p.series.length < 2) return 0; const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ if(!p || !p.series || p.series.length < 2) return ''; const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%' }
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
</style>
