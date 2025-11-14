<template>
  <section class="col col-right">
    <div class="research-section">
      <h3 class="research-title">研究 · 本期项目洞察</h3>
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
      <div class="dialogue-list">
        <div v-for="(m,i) in messages" :key="'msg-'+i" :class="['msg', m.role]">{{ m.text }}</div>
      </div>
      <div class="question-list">
        <div class="question-item" @click="quickAsk('假设: 采购延误3天，对总体回报率的影响?')">假设: 采购延误3天，对总体回报率的影响?</div>
        <div class="question-item" @click="quickAsk('推进至里程碑M3当前一周，风险变化怎样?')">推进至里程碑M3当前一周，风险变化怎样?</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const searchQuery = ref('')
const messages = ref([])
function pushMsg(text, role){ messages.value.push({ text, role }) }
function onSearch(){ const v=(searchQuery.value||'').trim(); if(!v) return; pushMsg(v,'user'); searchQuery.value=''; setTimeout(()=>reply(v), 400) }
function quickAsk(text){ pushMsg(text,'user'); setTimeout(()=>reply(text), 300) }
function reply(text){ const r='占位回复：已记录问题“'+text+'”，将在接入真实数据后提供分析。'; pushMsg(r,'ai') }
onMounted(()=>{ pushMsg('你好，可点击下方假设问题或直接提问。','ai') })
</script>

<style scoped>
.research-content { font-size: 14px; line-height: 1.4; color: var(--text); margin-bottom: 12px; padding: 0 16px; }
</style>