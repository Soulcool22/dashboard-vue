<template>
  <div class="card wl-card" :class="{ 'is-expanded': isExpanded }">
    <div class="wl-header" :class="{ 'is-expanded': isExpanded && projects.length > 0 }">
      <div>
        <h3>关注项目</h3>
        <div class="sub">各项目进度兑现指数趋势<InfoIcon tip="进度兑现指数：衡量项目按照计划的兑现程度，范围 0-100，越高越好，当前基准线为80。
        *计算规则*：指数 = Σ(管理层指标标准化评分 × 权重占比)
        其中各管理层指标以及权重占比：
        开工准点率：10%
        完工准点率：20%
        关键里程碑达成率：35%
        平均任务工期比：15%
        逾期恢复时长：5%
        逾期积压率：7.5%
        逾期解决率：7.5%" /></div>
      </div>
      <div class="header-actions">
        <el-button class="expand-btn" :class="{ 'active': isSearchVisible }" type="text" @click="toggleSearch" ref="searchToggleRef">
          <Search theme="outline" size="18" :strokeWidth="4" />
        </el-button>
        <el-button class="expand-btn" type="text" @click="$emit('toggle-left')" :class="{ 'active': isExpanded }">
          <MenuFold v-if="isExpanded" theme="outline" size="18" :strokeWidth="4" />
          <MenuUnfold v-else theme="outline" size="18" :strokeWidth="4" />
        </el-button>
      </div>
      <div class="wl-columns" v-if="isExpanded && !isSearchVisible && projects && projects.length > 0">
        <div>项目名称</div>
        <div>进度指数缩略图</div>
        <div>关键里程碑达成率</div>
        <div>开工准点率</div>
        <div>完工准点率</div>
        <div>平均工期比</div>
        <div>逾期趋势比</div>
        <div>进度兑现指数</div>
      </div>
    </div>
    <div class="wl-list" v-if="!isSearchVisible">
      <!-- 空状态显示 -->
      <EmptyState 
        v-if="!projects || projects.length === 0"
        title="暂无关注项目"
        description="点击搜索添加关注项目"
        icon="folder"
        variant="list"
        compact
      />
      <div 
        v-for="(p, idx) in projects" 
        :key="'wl-'+idx"
        :class="['wl-item', { 'active': activeProject && activeProject.name === p.name }]"
        @click="$emit('select-project', p)"
      >
        <div class="wl-info">
          <div class="wl-name">{{ p.name }}</div>
          <div class="wl-sub">{{ p.sector }}</div>
        </div>
        <SparkLine :series="p.series" />
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price unavailable">--</div>
          <div class="wl-delta unavailable">暂无数据</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ startOnTimeValue(p) }}</div>
          <div class="wl-delta" :class="startOnTimeDeltaSign(p) >= 0 ? 'up' : 'down'">{{ startOnTimeDeltaText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ completeOnTimeValue(p) }}</div>
          <div class="wl-delta" :class="completeOnTimeDeltaSign(p) >= 0 ? 'up' : 'down'">{{ completeOnTimeDeltaText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ avgDurationRatioValue(p) }}</div>
          <div class="wl-delta" :class="avgDurationRatioDeltaSign(p) >= 0 ? 'up' : 'down'">{{ avgDurationRatioDeltaText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ overdueTrendRatioValue(p) }}</div>
          <div class="wl-delta" :class="overdueTrendRatioDeltaSign(p) >= 0 ? 'up' : 'down'">{{ overdueTrendRatioDeltaText(p) }}</div>
        </div>
        <div class="wl-right">
          <div class="wl-price">{{ formatIndexValue(lastValue(p)) }}</div>
          <div class="wl-delta" :class="deltaSign(p) >= 0 ? 'up' : 'down'">{{ deltaText(p) }}</div>
        </div>
      </div>
    </div>
    <div v-if="isSearchVisible" class="search-card" ref="searchCardRef">
      <div class="search-box">
        <div class="search-container">
          <el-input
            :model-value="searchQuery"
            @update:modelValue="$emit('update:searchQuery', $event)"
            placeholder="搜索全部项目..."
            clearable
          />
          <el-button type="primary" class="search-button">
            <Search theme="outline" size="16" />
          </el-button>
        </div>
      </div>
      <div class="wl-list search-list">
        <div 
          v-for="(p, idx) in allProjects" 
          :key="'wl-search-'+idx"
          class="wl-item"
          @click="$emit('select-project', p)"
        >
          <div class="wl-status" @click.stop="$emit('toggle-watch-status', p)">
            <CheckSmall v-if="p.isWatched" theme="two-tone" size="24" :fill="['#7f8081' ,'#ffffff']"/>
            <Plus v-else theme="two-tone" size="24" :fill="['#7f8081' ,'#ffffff']"/>
          </div>
          <div class="wl-info">
            <div class="wl-name">{{ p.name }}</div>
            <div class="wl-sub">{{ p.sector }}</div>
          </div>
          <div class="wl-price">{{ lastValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="deltaSign(p) >= 0 ? 'up' : 'down'">{{ deltaText(p) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import SparkLine from './SparkLine.vue'
import InfoIcon from './InfoIcon.vue'
import EmptyState from './EmptyState.vue'
import { Plus, CheckSmall, Search, MenuUnfold, MenuFold } from '@icon-park/vue-next'
import {
  getSeriesLastValue,
  getSeriesDeltaSign,
  getSeriesAverage,
  getSeriesMedian,
  formatPercent,
  formatDeltaPercent,
  formatRatio,
  formatDeltaRatio,
  formatSeriesDeltaText
} from '../utils'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  allProjects: { type: Array, default: () => [] },
  activeProject: { type: Object, default: null },
  isExpanded: { type: Boolean, default: false }
})
const emits = defineEmits(['toggle-left', 'update:searchQuery', 'toggle-watch-status', 'search-active-change', 'select-project'])

const isSearchVisible = ref(false)
const searchCardRef = ref(null)
const searchToggleRef = ref(null)

function toggleSearch() {
  isSearchVisible.value = !isSearchVisible.value
}

const handleClickOutside = (event) => {
  const toggleEl = searchToggleRef.value && (searchToggleRef.value.$el || searchToggleRef.value)
  if (
    searchCardRef.value &&
    !searchCardRef.value.contains(event.target) &&
    toggleEl &&
    !(toggleEl.contains && toggleEl.contains(event.target))
  ) {
    isSearchVisible.value = false
  }
}

watch(isSearchVisible, (newValue) => {
  emits('search-active-change', newValue) // Notify parent of any change
  nextTick(() => {
    if (newValue) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })
})

// 使用工具函数替代重复的辅助函数
function hasSeriesData(p) { 
  const series = p?.series
  return Array.isArray(series) && series.length > 0 
}
function lastValue(p) { return hasSeriesData(p) ? getSeriesLastValue(p?.series) : null }
function deltaSign(p) { return hasSeriesData(p) ? getSeriesDeltaSign(p?.series) : 0 }
function deltaText(p) { return hasSeriesData(p) ? formatSeriesDeltaText(p?.series) : '' }
function sampleSign(p) { return deltaSign(p) }
function sampleText(p) { return deltaText(p) }
function avgValue(p) { return hasSeriesData(p) ? getSeriesAverage(p?.series) : null }
function medianValue(p) { return hasSeriesData(p) ? getSeriesMedian(p?.series) : null }

// 格式化显示值，空数据显示 "--"
function formatIndexValue(v) { return v === null ? '--' : v.toFixed(2) }

function startOnTimeValue(p) { return formatPercent(p?.expandedMetrics?.startOnTimeRate) }
function startOnTimeDeltaSign(p) { return Number(p?.expandedMetrics?.startOnTimeRateDelta || 0) }
function startOnTimeDeltaText(p) { return formatDeltaPercent(p?.expandedMetrics?.startOnTimeRateDelta) }

function completeOnTimeValue(p) { return formatPercent(p?.expandedMetrics?.completeOnTimeRate) }
function completeOnTimeDeltaSign(p) { return Number(p?.expandedMetrics?.completeOnTimeRateDelta || 0) }
function completeOnTimeDeltaText(p) { return formatDeltaPercent(p?.expandedMetrics?.completeOnTimeRateDelta) }

function avgDurationRatioValue(p) { return formatRatio(p?.expandedMetrics?.avgDurationRatio) }
function avgDurationRatioDeltaSign(p) { return Number(p?.expandedMetrics?.avgDurationRatioDelta || 0) }
function avgDurationRatioDeltaText(p) { return formatDeltaRatio(p?.expandedMetrics?.avgDurationRatioDelta) }

// 逾期趋势比：比值 < 1 表示改善（向好），> 1 表示恶化（向差）
function overdueTrendRatioValue(p) { return formatRatio(p?.expandedMetrics?.overdueTrendRatio) }
// 对于趋势比，delta < 0 表示改善（显示绿色向上），delta > 0 表示恶化（显示红色向下）
function overdueTrendRatioDeltaSign(p) { return -Number(p?.expandedMetrics?.overdueTrendRatioDelta || 0) }
function overdueTrendRatioDeltaText(p) { return formatDeltaPercent(p?.expandedMetrics?.overdueTrendRatioDelta) }
</script>

<style scoped>
.wl-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.wl-header.is-expanded {
  padding-bottom: 34px; /* Make space for columns */
}

.wl-sample { text-align: center; }
.wl-columns {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: var(--muted);
  border-top: 1px solid var(--border);
  background: var(--card);
}
.wl-columns > div { display: flex; align-items: center; justify-content: center; }

.sub { display: flex; align-items: center; }
.header-actions { display: flex; align-items: center; cursor: pointer; }
.search-box { padding: 8px 12px; }

.wl-item {
  display: grid;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  position: relative;
  cursor: pointer;
}

.search-card {
  margin: 0 10px 10px;
  z-index: 10;
  border-radius: 12px;
  background-color: #fafdff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 1px solid var(--border);
}

.wl-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wl-price {
  font-weight: 600;
  font-size: 14px;
}

.wl-delta {
  font-size: 13px;
}

/* --- Watched List (Regular Style) --- */
.wl-list:not(.search-list) .wl-item {
  grid-template-columns: 1fr 80px 60px;
}

.wl-list:not(.search-list) .wl-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* --- Search List (New, Corrected Style) --- */
.search-list .wl-item {
  grid-template-columns: 24px 1fr auto auto;
  gap: 12px;
}

.search-list .wl-price,
.search-list .wl-delta {
  text-align: right;
  white-space: nowrap;
}

/* --- New Search Input Styles --- */
.search-container {
  position: relative;
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.search-container :deep(.el-input__wrapper) {
  border: 2px solid var(--accent);
  border-radius: 22px;
  background: var(--card);
  box-shadow: none;
  padding: 2px 14px;
}

.search-container :deep(.el-input__inner) {
  padding-right: 35px;
}

.expand-btn.active {
  color: var(--accent);
}

/* --- Expanded Layout Logic --- */
.is-expanded .wl-list:not(.search-list) .wl-item {
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr;
}
.is-expanded .wl-list:not(.search-list) .wl-right {
  justify-self: center;
  align-items: center;
  text-align: center;
}

.unavailable {
  color: var(--muted);
  opacity: 0.6;
}
</style>
