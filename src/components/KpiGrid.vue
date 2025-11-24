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
const props = defineProps({ kpis: { type: Array, default: () => [] }, selectedKpi: { type: String, default: '任务完成率' } })
const emit = defineEmits(['select-kpi'])

function handleClick(kpi) {
  emit('select-kpi', kpi)
}

function kDeltaText(k){ const s = k.up ? '↑ ' : '↓ '; const p = (k.title === '关键里程碑达成率' || k.title === '任务完成率') ? '较计划 ' : '环比 '; return p + s + k.delta }
function showDelta(k){ return k.title !== '资金到账率' }
</script>

<style scoped>
.kpi { cursor: pointer; transition: all 0.2s; }
.kpi:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.kpi.active { border-color: var(--accent); border-width: 1.5px; box-shadow: 0 2px 10px rgba(58,122,254,0.12); }
</style>