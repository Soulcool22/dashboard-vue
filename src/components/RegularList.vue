<template>
  <div class="card rl-card">
    <div class="wl-header">
      <div>
        <h3>常规列表</h3>
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
      <div class="wl-item" v-for="(p, idx) in regulars" :key="'rl-'+idx">
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
const props = defineProps({ regulars: { type: Array, default: () => [] }, modelValue: { type: Boolean, default: false } })
const emits = defineEmits(['update:modelValue'])
function toggle(){ emits('update:modelValue', !props.modelValue) }
const collapsed = computed(()=> props.modelValue)
function lastValue(p){ const a=p.series; return a[a.length-1] }
function deltaSign(p){ const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%' }
</script>

<style scoped>
</style>