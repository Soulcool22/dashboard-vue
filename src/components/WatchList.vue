<template>
  <div class="card wl-card">
    <div class="wl-header">
      <h3>关注项目</h3>
      <el-button class="expand-btn" type="text" @click="$emit('toggle-left')">
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 42H6V26" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 6H42V22" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </el-button>
    </div>
    <div class="sub">各项目进度兑现指数趋势（0-100）<InfoIcon tip="进度兑现指数：衡量项目按照计划的兑现程度，范围 0-100，越高越好，当前基准线为80。" /></div>
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
import SparkLine from './SparkLine.vue'
import InfoIcon from './InfoIcon.vue'
const props = defineProps({ projects: { type: Array, default: () => [] } })
function lastValue(p){ const a=p.series; return a[a.length-1] }
function deltaSign(p){ const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%' }
</script>

<style scoped>
.sub { display: flex; align-items: center; gap: 6px; }
</style>