<template>
  <header>
    <div class="brand">
      <span>项目管理系统</span>
      <span class="badge">数据看板</span>
    </div>
  </header>
  <main :class="['layout', { 'left-expanded': expandedLeft }]">
    <section class="col col-left">
      <WatchList :projects="projects" @toggle-left="toggleLeftExpand" />
      <RegularList v-model="regularCollapsed" :regulars="regulars" />
    </section>
    <section class="col col-middle">
      <div class="project-info">
        <div class="project-main-title">项目1</div>
        <div class="project-index-row">
          <div class="project-index-value">80.2</div>
          <div class="project-index-label">进度兑现指数</div>
          <div class="project-index-change">↑ +2.3%</div>
        </div>
      </div>
      <KpiGrid :kpis="kpis" />
      <CompletionLine />
      <BulletChart />
    </section>
    <ResearchChat />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import WatchList from './components/WatchList.vue'
import RegularList from './components/RegularList.vue'
import KpiGrid from './components/KpiGrid.vue'
import CompletionLine from './components/CompletionLine.vue'
import BulletChart from './components/BulletChart.vue'
import ResearchChat from './components/ResearchChat.vue'

const expandedLeft = ref(false)
const regularCollapsed = ref(false)
function toggleLeftExpand(){ expandedLeft.value = !expandedLeft.value }

const projects = ref([
  { name: '项目A', sector: '工程', series: [65,72,68,75,71,82,79,87,74,81,78,85,73,88,82,90] },
  { name: '项目B', sector: '制造', series: [72,68,65,62,58,61,67,64,69,66,63,59,65,62,68,65] },
  { name: '项目C', sector: '研发', series: [62,68,65,72,69,75,71,78,74,80,76,82,79,85,81,87] },
  { name: '项目D', sector: '施工', series: [68,72,75,78,81,84,87,85,82,79,83,86,84,88,85,90] },
  { name: '项目E', sector: '采购', series: [75,71,78,74,81,77,84,80,76,83,79,86,82,88,85,89] },
  { name: '项目F', sector: '云计算', series: [65,69,73,76,80,83,87,84,81,78,82,85,88,86,89,90] },
  { name: '项目G', sector: '新能源', series: [62,66,70,74,77,81,84,88,85,82,86,89,87,90,88,85] },
  { name: '项目H', sector: '医疗', series: [70,73,76,79,82,85,88,86,84,87,89,85,82,86,88,90] }
])

const regulars = ref([
  { name: '项目1', sector: '通信', series: [72,75,78,81,84,87,85,88,86,89,87,90,88,85,87,90] },
  { name: '项目2', sector: '财务', series: [65,68,71,74,77,80,83,86,84,87,85,88,86,89,87,90] },
  { name: '项目3', sector: '主食', series: [82,79,76,73,70,74,77,80,78,81,84,82,85,88,86,89] },
  { name: '项目4', sector: '工业', series: [62,65,68,71,74,77,80,83,81,84,87,85,88,86,89,90] },
  { name: '项目5', sector: '云计算', series: [75,78,81,84,87,85,88,86,89,87,90,88,85,87,89,90] },
  { name: '项目6', sector: '智能制造', series: [68,71,74,77,80,83,86,84,87,85,88,86,89,87,90,88] },
  { name: '项目7', sector: '新能源', series: [70,73,76,79,82,85,88,86,89,87,90,88,85,87,89,86] },
  { name: '项目8', sector: '医疗', series: [72,75,78,81,84,87,85,88,86,89,87,90,88,85,87,90] },
  { name: '项目9', sector: '数字科技', series: [78,81,84,87,85,88,86,89,87,90,88,85,87,89,86,88] },
  { name: '项目10', sector: '供应链', series: [73,76,79,82,85,88,86,89,87,90,88,85,87,89,86,88] }
])

const kpis = ref([
  { title: '任务完成率', value: '76%', delta: '+3%', up: true },
  { title: '开工准点率', value: '78%', delta: '+2%', up: true },
  { title: '完工准点率', value: '81%', delta: '+1%', up: true },
  { title: '关键里程碑达成率', value: '72%', delta: '-3%', up: false },
  { title: '逾期任务率', value: '22%', delta: '-1%', up: true }
])
</script>

<style scoped>
.project-info { display: flex; flex-direction: column; gap: 2px; padding: 6px 0 4px 10px; }
.project-main-title { font-size: 20px; font-weight: 700; color: var(--text); }
.project-index-row { display: flex; align-items: baseline; gap: 6px; }
.project-index-value { font-size: 22px; font-weight: 700; }
.project-index-label { font-size: 12px; color: var(--muted); }
.project-index-change { font-size: 12px; color: var(--up); }
</style>
