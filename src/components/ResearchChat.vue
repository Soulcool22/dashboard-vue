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
      <div class="dialogue-list" v-if="messages.length > 0">
        <div v-for="(msg, index) in messages" :key="index" :class="['msg', msg.role]">
          <strong>{{ msg.role === 'user' ? '我' : 'AI' }}:</strong> {{ msg.text }}
        </div>
      </div>
    </div>
    <div class="ai-dialogue-section">
      <transition name="slide-up">
        <div class="suggestions-panel" v-show="showSuggestions">
          <div class="suggestions-title">猜你想问</div>
          <div class="suggestions-list">
            <div 
              v-for="(item, index) in suggestions" 
              :key="index" 
              class="suggestion-item"
              @click="selectSuggestion(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </transition>
      <div class="search-container">
        <el-input 
          v-model="searchQuery" 
          placeholder="输入问题，例如：下周会有需求新增吗？" 
          clearable
          @focus="showSuggestions = true"
          @blur="handleBlur"
          @keyup.enter="onSearch"
        ></el-input>
        <el-button class="search-button" type="primary" @click="onSearch">↑</el-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const messages = ref([])
const showSuggestions = ref(false)

const suggestions = ref([
  '下周会有需求新增吗？',
  '当前项目的风险点有哪些？',
  '如何提升关键里程碑达成率？',
  '资源分配是否合理？'
])

function pushMsg(text, role){ messages.value.push({ text, role }) }

function onSearch(){ 
  const v = (searchQuery.value || '').trim(); 
  if(!v) return; 
  pushMsg(v, 'user'); 
  searchQuery.value = ''; 
  showSuggestions.value = false; // Hide suggestions on search
  setTimeout(() => reply(v), 400) 
}

function reply(text){ 
  const r = '占位回复：已记录问题“' + text + '”，将在接入真实数据后提供分析。'; 
  pushMsg(r, 'ai') 
}

function selectSuggestion(text) {
  searchQuery.value = text;
  onSearch();
}

function handleBlur() {
  // Delay hiding to allow click event on suggestion item to trigger first
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}
</script>

<style scoped>
.col-right { 
  display: flex; 
  flex-direction: column; 
  overflow-y: auto; /* Enable scrolling on the main container */
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
  scrollbar-width: none; /* Hide scrollbar for Firefox */
}
.col-right::-webkit-scrollbar { display: none; /* Hide scrollbar for Chrome/Safari */ }

.research-section { 
  /* Remove flex-grow and overflow-y to let it expand naturally */
  display: flex; 
  flex-direction: column; 
}

.research-title { font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: 600; color: var(--text); margin: 0; padding: 10px 16px; }
.research-content { font-size: 13px; line-height: 1.7; color: var(--text); margin-bottom: 12px; padding: 0 16px; letter-spacing: 0.1px; }
.research-content p { margin: 0 0 1.1em; }
.research-content strong { font-weight: 600; color: #1c2538; }
.research-content ul { list-style: none; padding-left: 0; margin: 1.1em 0; }
.research-content li { padding-left: 1.2em; position: relative; margin-bottom: 0.6em; }
.research-content li::before { content: '■'; position: absolute; left: 0; top: 0.1em; font-size: 0.7em; color: var(--accent); }
.col-right .search-container :deep(.el-input__inner) { font-size: 12.5px; }

/* Suggestions Panel */
.ai-dialogue-section { 
  position: relative; 
  background: var(--card); 
  padding: 10px 12px; 
  /* Remove margin-top: auto to let it follow content */
  /* Remove border-top for unified look */
  border-top: none; 
}
.suggestions-panel {
  position: absolute;
  bottom: 100%; /* Position above the input container */
  left: 12px;
  right: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px;
  margin-bottom: 8px;
  z-index: 10;
}

.suggestions-title {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

/* Transition Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.dialogue-list {
  margin: 0 16px 12px;
  padding: 10px;
  background: var(--bg);
  border-radius: 8px;
  font-size: 13px;
}
.msg { margin-bottom: 6px; }
.msg.user { color: var(--accent); }
.msg.ai { color: var(--text); }
</style>
