<template>
  <div class="card wl-card">
    <div class="wl-header">
      <div>
        <h3>关注项目</h3>
        <div class="sub">各项目进度兑现指数趋势<InfoIcon tip="进度兑现指数：衡量项目按照计划的兑现程度，范围 0-100，越高越好，当前基准线为80。" /></div>
      </div>
      <div class="header-actions">
        <el-button class="expand-btn" type="text" @click="isSearchVisible = !isSearchVisible">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="#7f8081" stroke-width="4" stroke-linejoin="round"/><path d="M33.2218 33.2218L41.7071 41.7071" stroke="#7f8081" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </el-button>
        <el-button class="expand-btn" type="text" @click="$emit('toggle-left')">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 42H6V26" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 6H42V22" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </el-button>
      </div>
    </div>
    <div v-if="isSearchVisible" class="search-box">
      <el-input
        :model-value="searchQuery"
        @update:modelValue="$emit('update:searchQuery', $event)"
        placeholder="搜索常规列表项目..."
        clearable
      />
    </div>
    <div class="wl-list">
      <div class="wl-item" v-for="(p, idx) in projects" :key="'wl-'+idx">
        <div class="wl-info">
          <div class="wl-name">{{ p.name }}</div>
          <div class="wl-sub">{{ p.sector }}</div>
        </div>
        <SparkLine :series="p.series" />
        <div class="wl-right">
          <div class="wl-price">{{ lastValue(p).toFixed(2) }}</div>
          <div class="wl-delta" :class="deltaSign(p) >= 0 ? 'up' : 'down'">{{ deltaText(p) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SparkLine from './SparkLine.vue'
import InfoIcon from './InfoIcon.vue'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' }
})
defineEmits(['toggle-left', 'update:searchQuery'])

const isSearchVisible = ref(false)

function lastValue(p){ const a=p.series; return a[a.length-1] }
function deltaSign(p){ const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%' }
</script>

<style scoped>
.sub { display: flex; align-items: center; }
.header-actions { display: flex; align-items: center; cursor: pointer; }
.search-box { padding: 4px 12px 8px; }
</style>