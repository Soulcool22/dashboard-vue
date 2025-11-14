<template>
  <div class="card chart-card" style="margin-top: 0;">
    <div class="kpi-grid">
      <el-card v-for="(k, ki) in kpis" :key="'kpi-'+ki" class="kpi" shadow="never">
        <div class="kpi-title">{{ k.title }}</div>
        <div class="kpi-value">{{ k.value }}</div>
        <div class="kpi-delta" :class="k.up ? 'up' : 'down'">{{ kDeltaText(k) }}</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ kpis: { type: Array, default: () => [] } })
function kDeltaText(k){ const s = k.up ? '↑ ' : '↓ '; const p = k.title === '关键里程碑达成率' ? '较计划 ' : '环比 '; return p + s + k.delta }
</script>

<style scoped>
</style>