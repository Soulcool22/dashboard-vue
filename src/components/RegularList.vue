<template>
  <div class="card rl-card" :class="{ 'is-expanded': isExpanded }">
    <div class="wl-header" :class="{ 'is-expanded': isExpanded && !collapsed && regulars.length > 0 }">
      <div>
        <h3>项目列表</h3>
        <div class="sub">可添加至关注列表</div>
      </div>
      <div class="wl-actions">
        <el-button class="expand-btn" type="text" @click="toggle">
          <Up v-if="!collapsed" theme="outline" size="20" fill="#7f8081" :strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <Down v-else theme="outline" size="20" fill="#7f8081" :strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </el-button>
      </div>
      <div class="wl-columns" v-if="isExpanded && !collapsed && regulars && regulars.length > 0">
        <div>项目名称</div>
        <div>进度指数缩略图</div>
        <div>关键里程碑达成率</div>
        <div>开工准点率</div>
        <div>完工准点率</div>
        <div>平均工期比</div>
        <div>逾期趋势比</div>
        <div>进度兑现指数</div>
      </div>
    </div>
    <div class="wl-list" v-show="!collapsed">
      <!-- 空状态显示 -->
      <EmptyState 
        v-if="!regulars || regulars.length === 0"
        title="暂无项目"
        description="项目数据尚未接入"
        icon="folder"
        variant="list"
        compact
      />
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
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price unavailable">--</div>
          <div class="wl-delta unavailable">暂无数据</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ startOnTimeValue(p) }}</div>
          <div class="wl-delta" :class="startOnTimeDeltaSign(p) >= 0 ? 'up' : 'down'">{{ startOnTimeDeltaText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ completeOnTimeValue(p) }}</div>
          <div class="wl-delta" :class="completeOnTimeDeltaSign(p) >= 0 ? 'up' : 'down'">{{ completeOnTimeDeltaText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ avgDurationRatioValue(p) }}</div>
          <div class="wl-delta" :class="avgDurationRatioDeltaSign(p) >= 0 ? 'up' : 'down'">{{ avgDurationRatioDeltaText(p) }}</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ overdueTrendRatioValue(p) }}</div>
          <div class="wl-delta" :class="overdueTrendRatioDeltaSign(p) >= 0 ? 'up' : 'down'">{{ overdueTrendRatioDeltaText(p) }}</div>
        </div>
        <div class="wl-right">
          <div class="wl-price">{{ formatIndexValue(lastValue(p)) }}</div>
          <div class="wl-delta" :class="deltaSign(p) >= 0 ? 'up' : 'down'">{{ deltaText(p) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SparkLine from './SparkLine.vue'
import EmptyState from './EmptyState.vue'
import { Up, Down } from '@icon-park/vue-next'
import {
  getSeriesLastValue,
  getSeriesDeltaSign,
  getSeriesAverage,
  getSeriesMedian,
  formatPercent,
  formatDeltaPercent,
  formatRatio,
  formatDeltaRatio,
  formatSeriesDeltaText
} from '../utils'

const props = defineProps({ 
  regulars: { type: Array, default: () => [] }, 
  modelValue: { type: Boolean, default: false },
  activeProject: { type: Object, default: null },
  isExpanded: { type: Boolean, default: false }
})
const emits = defineEmits(['update:modelValue', 'select-project'])
function toggle(){ emits('update:modelValue', !props.modelValue) }
const collapsed = computed(()=> props.modelValue)

// 使用工具函数替代重复的辅助函数
function hasSeriesData(p) { 
  const series = p?.series
  return Array.isArray(series) && series.length > 0 
}
function lastValue(p) { return hasSeriesData(p) ? getSeriesLastValue(p?.series) : null }
function deltaSign(p) { return hasSeriesData(p) ? getSeriesDeltaSign(p?.series) : 0 }
function deltaText(p) { return hasSeriesData(p) ? formatSeriesDeltaText(p?.series) : '' }
function sampleSign(p) { return deltaSign(p) }
function sampleText(p) { return deltaText(p) }
function avgValue(p) { return hasSeriesData(p) ? getSeriesAverage(p?.series) : null }
function medianValue(p) { return hasSeriesData(p) ? getSeriesMedian(p?.series) : null }

// 格式化显示值，空数据显示 "--"
function formatIndexValue(v) { return v === null ? '--' : v.toFixed(2) }

function startOnTimeValue(p) { return formatPercent(p?.expandedMetrics?.startOnTimeRate) }
function startOnTimeDeltaSign(p) { return Number(p?.expandedMetrics?.startOnTimeRateDelta || 0) }
function startOnTimeDeltaText(p) { return formatDeltaPercent(p?.expandedMetrics?.startOnTimeRateDelta) }

function completeOnTimeValue(p) { return formatPercent(p?.expandedMetrics?.completeOnTimeRate) }
function completeOnTimeDeltaSign(p) { return Number(p?.expandedMetrics?.completeOnTimeRateDelta || 0) }
function completeOnTimeDeltaText(p) { return formatDeltaPercent(p?.expandedMetrics?.completeOnTimeRateDelta) }

function avgDurationRatioValue(p) { return formatRatio(p?.expandedMetrics?.avgDurationRatio) }
function avgDurationRatioDeltaSign(p) { return Number(p?.expandedMetrics?.avgDurationRatioDelta || 0) }
function avgDurationRatioDeltaText(p) { return formatDeltaRatio(p?.expandedMetrics?.avgDurationRatioDelta) }

// 逾期趋势比：比值 < 1 表示改善（向好），> 1 表示恶化（向差）
function overdueTrendRatioValue(p) { return formatRatio(p?.expandedMetrics?.overdueTrendRatio) }
// 对于趋势比，delta < 0 表示改善（显示绿色向上），delta > 0 表示恶化（显示红色向下）
function overdueTrendRatioDeltaSign(p) { return -Number(p?.expandedMetrics?.overdueTrendRatioDelta || 0) }
function overdueTrendRatioDeltaText(p) { return formatDeltaPercent(p?.expandedMetrics?.overdueTrendRatioDelta) }
</script>

<style scoped>
.wl-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.wl-header.is-expanded {
  padding-bottom: 34px; /* Make space for columns */
}
.wl-sample { text-align: center; }
.wl-columns {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  color: var(--muted);
  border-top: 1px solid var(--border);
  background: var(--card);
}
.wl-columns > div { display: flex; align-items: center; justify-content: center; }

.wl-item {
  display: grid;
  grid-template-columns: 1fr 80px 60px;
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
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr;
}
.is-expanded .wl-right {
  justify-self: center;
  align-items: center;
  text-align: center;
}

.unavailable {
  color: var(--muted);
  opacity: 0.6;
}
</style>
