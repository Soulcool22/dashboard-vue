<template>
  <div class="card chart-card">
    <div class="card-header">
      <h3>资金到账率详情</h3>
    </div>
    <div class="fund-dashboard">
      <div class="fund-overview">
        <div class="fund-metric-box total">
          <div class="label">总应收金额</div>
          <div class="value"><span class="currency">¥</span><span class="amount">12,500,000</span></div>
        </div>
        <div class="fund-divider"></div>
        <div class="fund-metric-box received">
          <div class="label">实际已收</div>
          <div class="value highlight"><span class="currency">¥</span><span class="amount">9,500,000</span></div>
          <div class="sub-text">到账率 76%</div>
        </div>
        <div class="fund-divider"></div>
        <div class="fund-metric-box pending">
          <div class="label">待收金额</div>
          <div class="value"><span class="currency">¥</span><span class="amount">3,000,000</span></div>
        </div>
      </div>

      <div class="fund-stages">
        <div class="stage-header">
          <span>款项节点</span>
          <span>到账进度</span>
          <span>状态</span>
        </div>
        <div class="stage-list">
          <div v-for="(stage, idx) in fundStages" :key="idx" class="stage-item">
            <div class="stage-info">
              <span class="stage-name">{{ stage.name }}</span>
              <span class="stage-amount">应收: {{ stage.due }} / 实收: {{ stage.actual }}</span>
            </div>
            <div class="stage-progress">
              <el-progress :percentage="stage.percent" :status="stage.status === 'overdue' ? 'exception' : (stage.percent === 100 ? 'success' : '')" :stroke-width="8" :show-text="false" />
              <span class="progress-val">{{ stage.percent }}%</span>
            </div>
            <div class="stage-status">
              <span class="status-badge" :class="stage.status">{{ stage.statusText }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="fund-alerts" v-if="overdueItems.length > 0">
        <div class="alert-title">
          <icon-attention theme="filled" size="14" fill="#ef4444" />
          <span>逾期风险提醒</span>
        </div>
        <div class="alert-list">
          <div v-for="(item, idx) in overdueItems" :key="idx" class="alert-item">
            <span class="alert-dot"></span>
            <span class="alert-text">
              <span class="alert-stage">{{ item.name }}</span>
              应收 <span class="alert-money">{{ item.due }}</span>，
              已逾期 <span class="alert-days">{{ item.days }}</span> 天，
              请尽快催收。
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
 </template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const emit = defineEmits(['stats-changed'])

const fundStages = ref([
  { name: '预付款 (30%)', due: '¥375w', actual: '¥375w', percent: 100, status: 'normal', statusText: '已结清' },
  { name: '进度款-1期 (20%)', due: '¥250w', actual: '¥250w', percent: 100, status: 'normal', statusText: '已结清' },
  { name: '进度款-2期 (20%)', due: '¥250w', actual: '¥250w', percent: 100, status: 'normal', statusText: '已结清' },
  { name: '进度款-3期 (20%)', due: '¥250w', actual: '¥75w', percent: 30, status: 'overdue', statusText: '逾期未付' },
  { name: '质保金 (10%)', due: '¥125w', actual: '¥0', percent: 0, status: 'pending', statusText: '未达节点' }
])

const overdueItems = computed(() => {
  return [
    { name: '进度款-3期', due: '¥175w', days: 15 }
  ]
})

onMounted(() => {
  const last = 0.76
  const prev = 0.73
  const isUp = true
  emit('stats-changed', { last, prev, planLast: null, isUp, isOverview: false, kpi: '资金到账率' })
})
</script>

<style scoped>
.card-header { margin-bottom: 12px; }
.card-header h3 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
.fund-dashboard { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 0 4px; overflow-y: auto; }
.fund-overview { display: flex; align-items: center; justify-content: space-evenly; gap: 0; background: #f8fafc; padding: 12px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
.fund-metric-box { display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; flex: 1; }
.fund-metric-box .label { font-size: 12px; color: var(--muted); }
.fund-metric-box .value { font-size: 18px; font-weight: 700; color: var(--text); font-family: 'Roboto Mono', monospace; font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; line-height: 1.1; }
.fund-metric-box .value .currency { font-size: 0.9em; color: var(--muted); margin-right: 4px; }
.fund-metric-box .value .amount { letter-spacing: 0.2px; }
.fund-metric-box .value.highlight { color: var(--up); }
.fund-metric-box .sub-text { font-size: 11px; color: var(--up); background: #f0fdf4; padding: 1px 4px; border-radius: 4px; width: fit-content; border: 1px solid rgba(22,163,74,0.18); }
.fund-divider { width: 1px; height: 32px; background: #cbd5e1; margin: 0 12px; }
.fund-stages { display: flex; flex-direction: column; gap: 8px; }
.stage-header { display: grid; grid-template-columns: 2fr 3fr 1fr; font-size: 12px; color: var(--muted); padding: 0 4px; }
.stage-list { display: flex; flex-direction: column; gap: 8px; }
.stage-item { display: grid; grid-template-columns: 2fr 3fr 1fr; align-items: center; gap: 12px; padding: 8px 12px; background: #fff; border: 1px solid #f1f5f9; border-radius: 6px; transition: all 0.2s; }
.stage-item:hover { border-color: #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
.stage-info { display: flex; flex-direction: column; gap: 2px; }
.stage-name { font-size: 13px; font-weight: 600; color: var(--text); }
.stage-amount { font-size: 11px; color: var(--muted); }
.stage-progress { display: flex; align-items: center; gap: 8px; }
.stage-progress :deep(.el-progress) { flex: 1; }
.stage-progress :deep(.el-progress.is-success .el-progress-bar__inner) { background: var(--up) !important; }
.progress-val { font-size: 12px; color: var(--muted); width: 32px; text-align: right; }
.stage-status { display: flex; justify-content: flex-end; }
.status-badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 500; }
.status-badge.normal { background: #f0fdf4; color: #15803d; }
.status-badge.overdue { background: #fef2f2; color: #ef4444; }
.status-badge.pending { background: #f8fafc; color: #94a3b8; }
.fund-alerts { margin-top: 4px; background: #fff1f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 12px; }
.alert-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #991b1b; margin-bottom: 6px; }
.alert-list { display: flex; flex-direction: column; gap: 4px; }
.alert-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #7f1d1d; line-height: 1.4; }
.alert-dot { width: 4px; height: 4px; background: #ef4444; border-radius: 50%; margin-top: 6px; }
.alert-stage { font-weight: 600; }
.alert-money { font-weight: 700; font-family: 'Roboto Mono', monospace; }
.alert-days { font-weight: 700; text-decoration: underline; }
</style>