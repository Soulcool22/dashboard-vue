<template>
  <section class="col col-right">
    <div class="research-section">
      <h3 class="research-title">项目洞察</h3>
      <div class="research-content">
        <p><strong>项目整体表现分析：</strong>本期里程碑总体提升 2.3 个百分点，主要得益于采购环节的优化和生产效率的提升。其中，设计阶段完成率达到 85%，超出预期目标。</p>
        <p><strong>关键风险识别：</strong>采购环节平均延迟 3 天，预计影响兑现指数 0.8pp。主要原因为供应商交付周期延长，建议加强供应链缓冲管理，建立多供应商体系以降低单一依赖风险。</p>
        <p><strong>资源分配建议：</strong>当前人力投入与产出比为 1:1.2，建议将 20% 的资源重新分配至关键路径项目。跨部门协同效率提升 15%，但仍需加强评审机制。</p>
        <p><strong>下阶段重点关注：</strong></p>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>供应链稳定性监控与应急预案制定</li>
          <li>关键里程碑节点的前置风险评估</li>
          <li>跨部门协同流程的标准化与优化</li>
          <li>资源配置的动态调整机制建立</li>
        </ul>
        <p><strong>预测与建议：</strong>基于当前趋势分析，预计下期兑现指数将达到 82-85%，建议提前部署缓冲资源，确保关键节点按时交付。</p>
      </div>
    </div>
    <div class="ai-dialogue-section">
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="输入问题，例如：下周会有需求新增吗？" clearable></el-input>
        <el-button class="search-button" type="primary" @click="onSearch">↑</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const searchQuery = ref('')
const messages = ref([])
function pushMsg(text, role){ messages.value.push({ text, role }) }
function onSearch(){ const v=(searchQuery.value||'').trim(); if(!v) return; pushMsg(v,'user'); searchQuery.value=''; setTimeout(()=>reply(v), 400) }
function reply(text){ const r='占位回复：已记录问题“'+text+'”，将在接入真实数据后提供分析。'; pushMsg(r,'ai') }
</script>

<style scoped>
.col-right {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.research-section {
  flex-grow: 1;
  overflow-y: auto;
}
.research-content { font-size: 14px; line-height: 1.4; color: var(--text); margin-bottom: 12px; padding: 0 16px; }
</style>