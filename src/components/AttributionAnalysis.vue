<template>
  <div class="attribution-wrapper">
    <template v-if="selectedKpi !== '人员健康度'">
      <div class="attribution-header">
        <h3 class="attribution-title">
          <icon-analysis theme="outline" size="16" :strokeWidth="3" />
          归因分析
        </h3>
        <span class="insight-badge" :class="badgeToneClass">{{ attribution.type }}</span>
      </div>

      <div class="summary-section" :class="sectionToneClass">
        <div class="summary-text">{{ summaryText }}</div>
      </div>

      <div class="factors-section">
        <h4 class="section-subtitle">主要影响因素</h4>
        <div class="factor-list">
          <div 
            v-for="(factor, index) in attribution.factors" 
            :key="index" 
            class="factor-item"
            :class="factor.impact"
          >
            <div class="factor-header">
              <icon-check-one 
                v-if="factor.impact === 'positive'" 
                theme="filled" 
                size="16" 
                fill="#15803d"
              />
              <icon-close-one 
                v-if="factor.impact === 'negative'" 
                theme="filled" 
                size="16" 
                fill="#dc2626"
              />
              <icon-info 
                v-if="factor.impact === 'neutral'" 
                theme="filled" 
                size="16" 
                fill="#64748b"
              />
              <span class="factor-title">{{ factor.title }}</span>
              <span class="factor-value">{{ factor.value }}</span>
            </div>
            <p class="factor-description">{{ factor.description }}</p>
          </div>
        </div>
      </div>
    </template>

    <div class="recommendations-section" v-if="attribution.recommendations && attribution.recommendations.length > 0">
      <h4 class="section-subtitle">
        <icon-tips-one theme="outline" size="14" :strokeWidth="3" />
        改进建议
      </h4>
      <div class="recommendation-list">
        <div v-for="(rec, index) in attribution.recommendations" :key="index" class="recommendation-item">
          <span class="rec-bullet">{{ index + 1 }}</span>
          <span class="rec-text">{{ rec }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import * as dataService from '../services/dataService'

const props = defineProps({
  selectedKpi: { type: String, required: true },
  metrics: { type: Object, default: () => null },
  compareMode: { type: String, default: '' }
})

const attribution = computed(() => {
  return attributionState.value || {
    type: '',
    summary: '',
    factors: [],
    recommendations: []
  }
})

const attributionState = ref({ type: '', summary: '', factors: [], recommendations: [] })

async function load() {
  const data = await dataService.getAttributionData(props.selectedKpi)
  attributionState.value = {
    type: data?.type || '数据分析中',
    summary: data?.summary || '正在收集该指标的归因数据...',
    factors: Array.isArray(data?.factors) ? data.factors : [],
    recommendations: Array.isArray(data?.recommendations) ? data.recommendations : []
  }
}

watch(() => props.selectedKpi, () => {
  load()
}, { immediate: true })

const summaryText = computed(() => {
  const base = attribution.value.summary || ''
  const m = props.metrics
  if (!m || !m.value) return base
  const arrow = m.up ? '↑' : '↓'
  const sign = m.up ? '+' : '-'
  const mode = props.compareMode || (props.selectedKpi === '关键里程碑达成率' || props.selectedKpi === '任务完成率' ? '较计划' : '环比')
  const s = attribution.value.summary || ''
  const parts = s.split('。')
  const supp = parts.length > 1 ? parts.slice(1).join('。') : ''
  return '本期' + props.selectedKpi + '为 ' + m.value + '，' + mode + ' ' + arrow + ' ' + sign + m.delta + '。' + supp
})

const badgeToneClass = computed(() => {
  const t = (attribution.value.type || '')
  return t.includes('风险') ? 'red' : 'blue'
})

const sectionToneClass = computed(() => {
  const t = (attribution.value.type || '')
  return t.includes('风险') ? 'red-mode' : 'blue-mode'
})
</script>

<style scoped>
.attribution-wrapper {
  background-color: var(--card);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.attribution-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.insight-badge {
  font-size: 11px;
  font-weight: normal;
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.insight-badge {
  color: var(--accent);
  background-color: var(--accent-soft);
  border: 1px solid rgba(88, 158, 248, 0.2);
}

.insight-badge.blue {
  color: var(--accent);
  background-color: var(--accent-soft);
  border-color: rgba(88, 158, 248, 0.2);
}


.insight-badge.red {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.22);
}

.summary-section {
  background: linear-gradient(135deg, rgba(88, 158, 248, 0.05) 0%, rgba(88, 158, 248, 0.02) 100%);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid var(--accent);
}

.summary-section.blue-mode {
  background: linear-gradient(135deg, rgba(88, 158, 248, 0.05) 0%, rgba(88, 158, 248, 0.02) 100%);
  border-left-color: var(--accent);
}


.summary-section.red-mode {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(239, 68, 68, 0.015) 100%);
  border-left-color: #ef4444;
}

.summary-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
}

.factors-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-subtitle {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.factor-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor-item {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.factor-item:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.factor-item.positive {
  background: linear-gradient(135deg, rgba(21, 128, 61, 0.03) 0%, rgba(21, 128, 61, 0.01) 100%);
}

.factor-item.negative {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, rgba(220, 38, 38, 0.01) 100%);
}

.factor-item.neutral {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.03) 0%, rgba(100, 116, 139, 0.01) 100%);
}

.factor-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.factor-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.factor-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

.factor-item.positive .factor-value {
  color: #15803d;
}

.factor-item.negative .factor-value {
  color: #dc2626;
}

.factor-description {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
  padding-left: 22px;
}

.recommendations-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text);
}

.rec-bullet {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.rec-text {
  flex: 1;
  padding-top: 1px;
}
</style>
