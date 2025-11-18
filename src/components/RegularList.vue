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
    <div class="wl-columns" v-if="isExpanded && !collapsed && regulars && regulars.length">
      <div>项目名称</div>
      <div>进度缩略图</div>
      <div>关键里程碑达成率</div>
      <div>开工准点率</div>
      <div>完工准点率</div>
      <div>列名6</div>
      <div>列名7</div>
      <div>进度兑现指数</div>
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
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ avgValue(p).toFixed(2) }}</div>
          <div class="wl-delta">平均</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ maxValue(p).toFixed(2) }}</div>
          <div class="wl-delta">最大</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ minValue(p).toFixed(2) }}</div>
          <div class="wl-delta">最小</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ rangeValue(p).toFixed(2) }}</div>
          <div class="wl-delta">幅度</div>
        </div>
        <div class="wl-sample" v-if="isExpanded">
          <div class="wl-price">{{ medianValue(p).toFixed(2) }}</div>
          <div class="wl-delta">中位</div>
        </div>
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
function avgValue(p){ const a=p.series||[]; if(!a.length) return 0; return a.reduce((s,v)=>s+v,0)/a.length }
function maxValue(p){ const a=p.series||[]; if(!a.length) return 0; return Math.max(...a) }
function minValue(p){ const a=p.series||[]; if(!a.length) return 0; return Math.min(...a) }
function rangeValue(p){ const a=p.series||[]; if(!a.length) return 0; return maxValue(p)-minValue(p) }
function medianValue(p){ const a=(p.series||[]).slice().sort((x,y)=>x-y); if(!a.length) return 0; const m=Math.floor(a.length/2); return a.length%2? a[m] : (a[m-1]+a[m])/2 }
</script>

<style scoped>
.wl-sample { text-align: center; }
.wl-columns {
  display: grid;
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted);
}
.wl-columns > div { display: flex; align-items: center; justify-content: center; }

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
.is-expanded .wl-columns {
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr; /* match item columns */
}
.is-expanded .wl-item {
  grid-template-columns: 120px 80px repeat(5, 1fr) 1fr; /* info | sparkline | 5 samples | right */
}
.is-expanded .wl-right {
  justify-self: center;
  align-items: center;
  text-align: center;
}
</style>
