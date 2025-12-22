<template>
  <div class="card chart-card" style="margin-top: 0;">
    <div class="kpi-grid">
      <el-card 
        v-for="(k, ki) in kpis" 
        :key="'kpi-'+ki" 
        :class="['kpi', selectedKpi === k.title ? 'active' : '']" 
        shadow="never"
        @click="handleClick(k)"
      >
        <div class="kpi-title">{{ k.title }}</div>
        <div class="kpi-value">{{ k.value }}</div>
        <div v-if="showDelta(k)" class="kpi-delta" :class="k.up ? 'up' : 'down'">{{ kDeltaText(k) }}</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { getKpiConfig } from '../config'

const props = defineProps({ kpis: { type: Array, default: () => [] }, selectedKpi: { type: String, default: '任务完成率' } })
const emit = defineEmits(['select-kpi'])

function handleClick(kpi) {
  emit('select-kpi', kpi)
}

/**
 * 获取KPI变化量文本
 * 根据配置中的compareMode决定显示"较计划"还是"环比"
 * @param {Object} k - KPI对象
 * @returns {string} 变化量文本
 */
function kDeltaText(k) {
  const config = getKpiConfig(k.title)
  const s = k.up ? '↑ ' : '↓ '
  
  // 根据配置的compareMode决定前缀
  let prefix = '环比 '
  if (config?.compareMode === 'plan') {
    prefix = '较计划 '
  }
  
  return prefix + s + k.delta
}

/**
 * 判断是否显示变化量
 * 根据配置中的showDelta属性决定
 * @param {Object} k - KPI对象
 * @returns {boolean} 是否显示变化量
 */
function showDelta(k) {
  const config = getKpiConfig(k.title)
  // 如果找到配置，使用配置的showDelta；否则默认显示
  return config ? config.showDelta : true
}
</script>

<style scoped>
.kpi { cursor: pointer; transition: all 0.2s; }
.kpi:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.kpi.active { border-color: var(--accent); border-width: 1.5px; box-shadow: 0 2px 11px rgba(26,115,232,0.20), 0 4px 6px rgba(26,115,232,0.15); }
</style>
