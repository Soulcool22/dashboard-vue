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
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M33.2218 33.2218L41.7071 41.7071" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </el-button>
        <el-button class="expand-btn" type="text" @click="$emit('toggle-left')" :class="{ 'active': isExpanded }">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 42H6V26" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 6H42V22" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </el-button>
      </div>
      <div class="wl-columns" v-if="isExpanded && !isSearchVisible && projects && projects.length > 0">
        <div>项目名称</div>
        <div>进度缩略图</div>
        <div>关键里程碑达成率</div>
        <div>开工准点率</div>
        <div>完工准点率</div>
        <div>列名6</div>
        <div>列名7</div>
        <div>进度兑现指数</div>
      </div>
    </div>
    <div class="wl-list" v-if="!isSearchVisible">
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
          <div class="wl-price">{{ avgValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="sampleSign(p) >= 0 ? 'up' : 'down'">{{ sampleText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ maxValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="sampleSign(p) >= 0 ? 'up' : 'down'">{{ sampleText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ minValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="sampleSign(p) >= 0 ? 'up' : 'down'">{{ sampleText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ rangeValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="sampleSign(p) >= 0 ? 'up' : 'down'">{{ sampleText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ medianValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="sampleSign(p) >= 0 ? 'up' : 'down'">{{ sampleText(p) }}</div>
        </div>
        <div class="wl-right">
          <div class="wl-price">{{ lastValue(p).toFixed(2) }}</div>
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
            <check-small v-if="p.isWatched" theme="two-tone" size="24" :fill="['#7f8081' ,'#ffffff']"/>
            <plus v-else theme="two-tone" size="24" :fill="['#7f8081' ,'#ffffff']"/>
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
import { Plus, CheckSmall, Search } from '@icon-park/vue-next'

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
  if (
    searchCardRef.value &&
    !searchCardRef.value.contains(event.target) &&
    searchToggleRef.value &&
    !searchToggleRef.value.$el.contains(event.target)
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

function lastValue(p){ const a=p.series; return a[a.length-1] }
function deltaSign(p){ const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s.replace(' ','') + Math.abs(pct)+'%' }
function sampleSign(p){ return deltaSign(p) }
function sampleText(p){ return deltaText(p) }
function avgValue(p){ const a=p.series||[]; if(!a.length) return 0; return a.reduce((s,v)=>s+v,0)/a.length }
function maxValue(p){ const a=p.series||[]; if(!a.length) return 0; return Math.max(...a) }
function minValue(p){ const a=p.series||[]; if(!a.length) return 0; return Math.min(...a) }
function rangeValue(p){ const a=p.series||[]; if(!a.length) return 0; return maxValue(p)-minValue(p) }
function medianValue(p){ const a=(p.series||[]).slice().sort((x,y)=>x-y); if(!a.length) return 0; const m=Math.floor(a.length/2); return a.length%2? a[m] : (a[m-1]+a[m])/2 }
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
  box-shadow: 0 2px 6px rgba(58,122,254,0.24);
}

.search-container :deep(.el-input__wrapper) {
  border: 1px solid var(--border);
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
</style>
