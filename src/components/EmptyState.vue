<template>
  <div class="empty-state" :class="[variant, { compact }]">
    <div class="empty-icon" :class="iconClass">
      <slot name="icon">
        <component :is="iconComponent" v-if="iconComponent" theme="outline" :size="iconSize" />
        <span v-else class="default-icon">{{ defaultIconText }}</span>
      </slot>
    </div>
    <div class="empty-content">
      <div class="empty-title">{{ title }}</div>
      <div v-if="description" class="empty-description">{{ description }}</div>
    </div>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Data, ChartLine, Peoples, FolderOpen } from '@icon-park/vue-next'

const props = defineProps({
  /** 标题文本 */
  title: { type: String, default: '暂无数据' },
  /** 描述文本 */
  description: { type: String, default: '' },
  /** 变体样式: default, chart, list */
  variant: { type: String, default: 'default' },
  /** 图标类型: data, chart, people, folder */
  icon: { type: String, default: 'data' },
  /** 是否紧凑模式 */
  compact: { type: Boolean, default: false }
})

const iconMap = {
  data: Data,
  chart: ChartLine,
  people: Peoples,
  folder: FolderOpen
}

const iconComponent = computed(() => iconMap[props.icon] || null)

const defaultIconText = computed(() => {
  if (props.icon === 'data') return '∅'
  if (props.icon === 'chart') return '📊'
  if (props.icon === 'people') return '👥'
  return '📁'
})

const iconSize = computed(() => props.compact ? 20 : 24)

const iconClass = computed(() => {
  return {
    'icon-data': props.icon === 'data',
    'icon-chart': props.icon === 'chart',
    'icon-people': props.icon === 'people',
    'icon-folder': props.icon === 'folder'
  }
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  gap: 12px;
}

.empty-state.compact {
  padding: 16px 12px;
  gap: 8px;
}

.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #94a3b8;
}

.empty-state.compact .empty-icon {
  width: 40px;
  height: 40px;
}

.empty-icon.icon-data {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
}

.empty-icon.icon-chart {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #3b82f6;
}

.empty-icon.icon-people {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #137333;
}

.empty-icon.icon-folder {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.default-icon {
  font-size: 24px;
  font-weight: 600;
}

.empty-state.compact .default-icon {
  font-size: 18px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text, #202124);
}

.empty-state.compact .empty-title {
  font-size: 13px;
}

.empty-description {
  font-size: 12px;
  color: var(--muted, #5f6368);
  max-width: 200px;
}

.empty-state.compact .empty-description {
  font-size: 11px;
}

/* Variant: chart - 用于图表区域 */
.empty-state.chart {
  background: #fafbfc;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
  min-height: 200px;
}

.empty-state.chart.compact {
  min-height: 120px;
}

/* Variant: list - 用于列表区域 */
.empty-state.list {
  padding: 24px 16px;
}

.empty-state.list.compact {
  padding: 12px 8px;
}
</style>
