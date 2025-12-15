<template>
  <div class="health-view-container">
    <!-- 左侧：核心健康度指标 -->
    <div class="health-summary">
      <div class="health-score-block">
        <div class="score-ring" :class="healthStatus.class">
          <span class="score-value">{{ healthScore }}</span>
          <span class="score-unit">%</span>
        </div>
        <div class="score-info">
          <span class="score-label">人员健康度</span>
          <span class="score-status" :class="healthStatus.class">{{ healthStatus.text }}</span>
        </div>
      </div>
      
      <div class="summary-stats">
        <div class="stat-row total">
          <div class="stat-icon">
            <icon-peoples theme="outline" size="14" />
          </div>
          <div class="stat-content">
            <span class="stat-label">团队人数</span>
            <span class="stat-value">{{ totalMembers }} <span class="stat-unit">人</span></span>
          </div>
        </div>
        <div class="stat-row-group">
          <div class="stat-row-mini safe">
            <span class="stat-dot"></span>
            <span class="stat-label">正常</span>
            <span class="stat-value">{{ normalMembers }}</span>
          </div>
          <div class="stat-row-mini warning">
            <span class="stat-dot"></span>
            <span class="stat-label">风险</span>
            <span class="stat-value">{{ riskMembers }}</span>
          </div>
        </div>
        <div class="stat-row avg">
          <div class="stat-icon">
            <icon-chart-line theme="outline" size="14" />
          </div>
          <div class="stat-content">
            <span class="stat-label">人均挂名</span>
            <span class="stat-value">{{ avgProjects }} <span class="stat-unit">个</span></span>
          </div>
        </div>
      </div>
      
      <div class="definition-note">
        <span class="note-icon">i</span>
        <span class="note-text">挂名项目 > 3 个判定为风险人员</span>
      </div>
    </div>

    <!-- 右侧：人员清单 -->
    <div class="risk-panel">
      <div class="panel-header">
        <div class="header-left">
          <span class="panel-title">人员列表</span>
          <span class="panel-count">{{ totalMembers }} 人</span>
        </div>
        <div class="header-right">
          <div class="search-expand-wrapper" :class="{ expanded: showSearch }">
            <input 
              v-if="showSearch"
              ref="searchInputRef"
              v-model="searchKeyword" 
              type="text"
              class="search-input-inline"
              placeholder="搜索人员..."
              @blur="onSearchBlur"
            />
            <span class="search-toggle" @click="toggleSearch">
              <icon-search v-if="!showSearch" theme="outline" size="14" />
              <icon-close v-else theme="outline" size="14" />
            </span>
          </div>
        </div>
      </div>
      
      <div class="member-list" :class="{ expanded: isExpanded }">
        <div v-if="filteredMembers.length === 0" class="empty-state">
          <div class="empty-icon">0</div>
          <div class="empty-text">暂无数据</div>
          <div class="empty-sub">人员数据尚未接入</div>
        </div>
        <div v-else class="member-item" v-for="member in displayedMembers" :key="member.id" :class="{ 'is-risk': member.projectCount > 3 }">
          <div class="member-info">
            <span class="member-avatar" :class="{ 'avatar-risk': member.projectCount > 3 }">{{ member.name.charAt(0) }}</span>
            <div class="member-detail">
              <span class="member-name">{{ member.name }}</span>
              <span class="member-role">{{ member.role }}</span>
            </div>
          </div>
          <div class="member-load">
            <div class="load-indicator">
              <span class="load-count" :class="{ 'count-risk': member.projectCount > 3 }">{{ member.projectCount }}</span>
              <span class="load-label">个项目</span>
            </div>
            <div class="load-bar-wrap">
              <div class="load-bar-bg">
                <div class="load-bar-fill" :class="{ 'fill-safe': member.projectCount <= 3 }" :style="{ width: Math.min(member.projectCount / 6 * 100, 100) + '%' }"></div>
              </div>
            </div>
          </div>
          <el-popover placement="left" :width="160" trigger="hover">
            <template #reference>
              <span class="view-projects">查看</span>
            </template>
            <div class="popover-content">
              <div class="popover-title">参与项目</div>
              <ul class="popover-list">
                <li v-for="p in member.projects" :key="p">{{ p }}</li>
              </ul>
            </div>
          </el-popover>
        </div>
      </div>
      
      <!-- View All 按钮 -->
      <div class="view-all-wrapper" v-if="filteredMembers.length > 5">
        <span class="view-all-badge" @click="isExpanded = !isExpanded">
          {{ isExpanded ? '收起' : `展开全部 +${filteredMembers.length - 5}` }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { Search as IconSearch, Down as IconDown, Up as IconUp, Peoples as IconPeoples, ChartLine as IconChartLine, Close as IconClose } from '@icon-park/vue-next'
import { Search } from '@element-plus/icons-vue'
import * as dataService from '../../services/dataService'

const props = defineProps({
  projectContext: { type: Object, default: () => ({}) },
  project: { type: Object, default: () => null }
})

const projectId = computed(() => props.project?.id || props.project?.projectId || props.project?.name || props.projectContext?.id || props.projectContext?.projectId || props.projectContext?.name || null)

// --- State ---
const showSearch = ref(false)
const searchKeyword = ref('')
const isExpanded = ref(false)
const searchInputRef = ref(null)

// 搜索框展开/收起
async function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    searchKeyword.value = ''
  }
}

function onSearchBlur() {
  if (!searchKeyword.value) {
    showSearch.value = false
  }
}

// --- Mock Data ---
const allMembers = ref([
  
])

async function load() {
  const data = await dataService.getPersonnelData(projectId.value)
  allMembers.value = Array.isArray(data?.members) ? data.members : []
}

watch(() => projectId.value, () => {
  load()
}, { immediate: true })

// --- Computed ---
const totalMembers = computed(() => allMembers.value.length)
const riskMembers = computed(() => allMembers.value.filter(m => m.projectCount > 3).length)
const normalMembers = computed(() => totalMembers.value - riskMembers.value)
const avgProjects = computed(() => {
  if (!totalMembers.value) return '0.0'
  const sum = allMembers.value.reduce((acc, curr) => acc + curr.projectCount, 0)
  return (sum / totalMembers.value).toFixed(1)
})
const healthScore = computed(() => {
  if (!totalMembers.value) return 0
  const ratio = normalMembers.value / totalMembers.value
  return Math.round(ratio * 100)
})

const healthStatus = computed(() => {
  const score = healthScore.value
  if (score >= 80) return { text: '良好', class: 'good' }
  if (score >= 60) return { text: '预警', class: 'warn' }
  return { text: '危险', class: 'danger' }
})

// 按风险度排序（项目数从高到低）
const sortedMembers = computed(() => {
  return [...allMembers.value].sort((a, b) => b.projectCount - a.projectCount)
})

// 搜索过滤
const filteredMembers = computed(() => {
  if (!searchKeyword.value) return sortedMembers.value
  const keyword = searchKeyword.value.toLowerCase()
  return sortedMembers.value.filter(m => 
    m.name.toLowerCase().includes(keyword) || 
    m.role.toLowerCase().includes(keyword)
  )
})

// 展示的人员（未展开时只显示5个）
const displayedMembers = computed(() => {
  if (isExpanded.value) return filteredMembers.value
  return filteredMembers.value.slice(0, 5)
})
</script>

<style scoped>
.health-view-container {
  display: flex;
  height: 100%;
  width: 100%;
  gap: 20px;
  margin-top: 16px;
}

/* 左侧健康度摘要 */
.health-summary {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.health-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  background: #fff;
  border-radius: 12px;
}

.score-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  position: relative;
}

.score-ring::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
}

.score-ring.good::before { border-color: #137333; }
.score-ring.warn::before { border-color: #e6a23c; }
.score-ring.danger::before { border-color: #a50e0e; }

.score-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-number);
  line-height: 1;
}

.score-unit {
  font-size: 14px;
  color: var(--muted);
  font-weight: 400;
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-label {
  font-size: 12px;
  color: var(--muted);
}

.score-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 10px;
}

.score-status.good { background: #f0fdf4; color: #137333; }
.score-status.warn { background: #fff7ed; color: #c2410c; }
.score-status.danger { background: #fef2f2; color: #a50e0e; }

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
}

.stat-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 6px;
  color: var(--muted);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: var(--muted);
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-number);
}

.stat-unit {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted);
}

/* 正常/风险分组 */
.stat-row-group {
  display: flex;
  gap: 6px;
}

.stat-row-mini {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #fff;
  border-radius: 6px;
}

.stat-row-mini .stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.stat-row-mini.safe .stat-dot { background: #22c55e; }
.stat-row-mini.warning .stat-dot { background: #f97316; }

.stat-row-mini .stat-label {
  font-size: 11px;
  color: var(--muted);
  flex: 1;
}

.stat-row-mini .stat-value {
  font-size: 14px;
  font-weight: 600;
}

.stat-row-mini.safe .stat-value { color: #137333; }
.stat-row-mini.warning .stat-value { color: #ea580c; }

.definition-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 6px;
  margin-top: auto;
}

.note-icon {
  width: 16px;
  height: 16px;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.note-text {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
}

/* 右侧人员面板 */
.risk-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: transparent;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 12px 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.panel-count {
  font-size: 11px;
  color: var(--muted);
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.search-expand-wrapper {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 16px;
  background: transparent;
  transition: all 0.25s ease;
  border: 1px solid transparent; /* Prepare for border transition */
}

.search-expand-wrapper.expanded {
  background: #fff;
  padding-left: 12px;
  border: 2px solid var(--accent); /* Blue border */
  box-shadow: 0 2px 8px rgba(88, 158, 248, 0.1);
}

.search-input-inline {
  width: 140px;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text);
}

.search-input-inline::placeholder {
  color: #9ca3af;
}

.search-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
  flex-shrink: 0;
}

.search-expand-wrapper.expanded .search-toggle {
  background: var(--accent);
  color: #fff;
  width: 28px;
  height: 28px;
  margin-right: 2px; /* Slight spacing from right edge */
}

.search-toggle:hover {
  background: #f1f5f9;
  color: var(--text);
}

.search-expand-wrapper.expanded .search-toggle:hover {
  background: #4080e0; /* Darker accent */
  color: #fff;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.member-list.expanded {
  overflow-y: auto;
  max-height: 320px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.15s;
  position: relative;
}

.member-item:hover {
  background: #f8fafc;
}

.member-item.is-risk {
  background: transparent;
}

.member-item.is-risk::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: #f97316;
  border-radius: 0 2px 2px 0;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
}

.member-avatar.avatar-risk {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: #fff;
}

.member-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.member-role {
  font-size: 11px;
  color: var(--muted);
}

.member-load {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.load-indicator {
  display: flex;
  align-items: baseline;
  gap: 2px;
  min-width: 60px;
}

.load-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  font-family: var(--font-number);
}

.load-count.count-risk {
  color: #c2410c;
}

.load-label {
  font-size: 11px;
  color: var(--muted);
}

.load-bar-wrap {
  flex: 1;
  max-width: 120px;
}

.load-bar-bg {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.load-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f97316);
  border-radius: 2px;
  transition: width 0.3s;
}

.load-bar-fill.fill-safe {
  background: linear-gradient(90deg, #86efac, #22c55e);
}

.view-projects {
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.view-projects:hover {
  background: #eff6ff;
}

/* Popover */
.popover-content {
  font-size: 12px;
}

.popover-title {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.popover-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 120px;
  overflow-y: auto;
}

.popover-list li {
  padding: 3px 0;
  color: #555;
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #137333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-top: 8px;
}

.empty-sub {
  font-size: 12px;
  color: var(--muted);
}

/* View All 按钮 */
.view-all-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}

.view-all-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
}

.view-all-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}
</style>
