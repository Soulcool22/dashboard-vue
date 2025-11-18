<template>
  <div class="card rl-card" :class="{ 'is-expanded': isExpanded }">
    <div class="wl-header">
      <div>
        <h3>项目列表</h3>
        <div class="sub">可添加至关注列表</div>
      </div>
      <div class="wl-actions">
        <el-button class="expand-btn" type="text" @click="toggle">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path v-if="!collapsed" d="M13 30L25 18L37 30" stroke="#7f8081" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path v-else d="M36 18L24 30L12 18" stroke="#7f8081" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </el-button>
      </div>
    </div>
    <div class="wl-list" v-show="!collapsed">
      <div 
        v-for="(p, idx) in regulars" 
        :key="'rl-'+idx"
        :class="['wl-item', { 'active': activeProject && activeProject.name === p.name }]"
        @click="$emit('select-project', p)"
      >
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
import { computed } from 'vue'
import SparkLine from './SparkLine.vue'
const props = defineProps({ 
  regulars: { type: Array, default: () => [] }, 
  modelValue: { type: Boolean, default: false },
  activeProject: { type: Object, default: null },
  isExpanded: { type: Boolean, default: false }
})
const emits = defineEmits(['update:modelValue', 'select-project'])
function toggle(){ emits('update:modelValue', !props.modelValue) }
const collapsed = computed(()=> props.modelValue)
function lastValue(p){ const a=p.series; return a[a.length-1] }
function deltaSign(p){ const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%'
}
</script>

<style scoped>
.wl-item {
  display: grid;
  grid-template-columns: 1fr 80px 60px; /* Match the grid in WatchList.vue */
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  position: relative;
  cursor: pointer;
}

.wl-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* --- Expanded Layout Logic --- */
.is-expanded .wl-item {
  grid-template-columns: 120px 80px 1fr; /* info | sparkline | flexible gap */
}
.is-expanded .wl-right {
  justify-self: end; /* Push data to the far right */
}
</style>
