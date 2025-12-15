<template>
  <section class="col col-right">
    <!-- Fixed Header -->
    <div class="header-section">
      <div class="header-content">
        <h3 class="research-title">{{ baseTitle }}</h3>
        <!-- Tab 切换（仅项目视图显示） -->
        <div class="view-tabs" v-if="!isCompanyView">
          <span class="tab-divider">|</span>
          <span 
            class="tab-link" 
            :class="{ active: !isAlternativeView }" 
            @click="isAlternativeView = false"
          >洞察</span>
          <span 
            class="tab-link" 
            :class="{ active: isAlternativeView }" 
            @click="isAlternativeView = true"
          >风险<span class="risk-dot" v-if="projectRisks.length > 0"></span></span>
        </div>
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="chat-content" ref="chatContainer">
      <!-- 默认视图：分析报告 + 对话 -->
      <template v-if="!isAlternativeView">
        <!-- Initial Analysis Report (Dynamic Content) -->
        <div class="research-content" v-html="currentAnalysis"></div>

        <!-- Dialogue History -->
        <div class="dialogue-container" v-if="messages.length > 0">
          <div v-for="(msg, index) in messages" :key="index" :class="['msg', msg.role]">
            <div class="msg-content">
              {{ msg.text }}
            </div>
          </div>
        </div>
      </template>

      <!-- 新视图：风险问题列表 -->
      <template v-else>
        <div class="risk-view">
          <template v-if="projectRisks && projectRisks.length > 0">
            <div class="risk-list">
              <div 
                v-for="(risk, index) in sortedRisks" 
                :key="index"
                class="risk-card"
                :class="risk.level"
              >
                <div class="risk-card-header">
                  <span class="risk-level-badge" :class="risk.level">{{ risk.levelText }}</span>
                  <span class="risk-category">{{ risk.category }}</span>
                </div>
                <div class="risk-section">
                  <div class="risk-label">问题描述</div>
                  <div class="risk-content">{{ risk.reason }}</div>
                </div>
                <div class="risk-section">
                  <div class="risk-label">建议行动</div>
                  <div class="risk-content action">{{ risk.action }}</div>
                </div>
                <div class="risk-footer">
                  <div class="risk-meta">
                    <span class="meta-item">
                      <span class="meta-label">影响：</span>
                      <span class="meta-value">{{ risk.impact }}</span>
                    </span>
                    <span class="meta-divider">|</span>
                    <span class="meta-item">
                      <span class="meta-label">截止：</span>
                      <span class="meta-value">{{ risk.deadline }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="empty-state">
              <div class="empty-icon">✓</div>
              <div class="empty-title">暂无风险问题</div>
              <div class="empty-desc">当前项目运行平稳</div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- Fixed Footer (Input Area) -->
    <div class="ai-dialogue-section">
      <div class="search-complex-wrapper" :class="{ 'is-expanded': showSuggestions }">
        <!-- Suggestions Area (Upward Extension) -->
        <div class="suggestions-area" v-show="showSuggestions">
          <div class="suggestions-header">
            <span class="title">猜你想问</span>
            <el-button link size="small" class="close-suggestions" @click="showSuggestions = false">
              <icon-down theme="outline" size="16" fill="#999"/>
            </el-button>
          </div>
          <div class="suggestions-list">
            <div 
              v-for="(item, index) in currentSuggestions" 
              :key="index" 
              class="suggestion-item"
              @click.stop="selectSuggestion(item)"
              @mousedown.prevent
            >
              {{ item }}
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <el-input 
            v-model="searchQuery" 
            placeholder="输入问题..." 
            clearable
            @focus="showSuggestions = true"
            @blur="handleBlur"
            @keyup.enter="onSearch"
            class="transparent-input"
          ></el-input>
          <button class="search-btn-round" @click="onSearch">
            <icon-up theme="outline" size="20" fill="#fff" :strokeWidth="3"/>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { Up, Down, Switch, Analysis, Caution } from '@icon-park/vue-next'

const props = defineProps({
  isCompanyView: { type: Boolean, default: true },
  currentProject: { type: Object, default: null }
})

const searchQuery = ref('')
const messages = ref([])
const showSuggestions = ref(false)
const chatContainer = ref(null)
const isAlternativeView = ref(false) // 新增：控制视图切换

// 切换视图函数
function toggleView() {
  isAlternativeView.value = !isAlternativeView.value
}

// 计算属性：获取当前项目的风险数据并排序
const projectRisks = computed(() => {
  if (!props.currentProject || !props.currentProject.risks) return []
  return props.currentProject.risks
})

const sortedRisks = computed(() => {
  const risks = [...projectRisks.value]
  const levelOrder = { 'high': 1, 'medium': 2, 'low': 3 }
  return risks.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
})

// --- Data Templates ---

const companySuggestions = [
  '下周会有需求新增吗？',
  '当前整体项目的风险点有哪些？'
]

const projectSuggestions = [
  '该项目本周进度正常吗？',
  '关键里程碑是否有延期风险？'
]

const companyAnalysis = `
  <p><strong>公司整体运营分析：
  <p><strong>关键风险识别：
  <p><strong>资源概览：
`

function getProjectAnalysis(projectName) {
  return `
    <p><strong>[${projectName}] 项目整体表现分析：
  `
} 

// --- Reactive State based on Context ---

const currentSuggestions = ref([...companySuggestions])
const currentAnalysis = ref(companyAnalysis)

const baseTitle = computed(() => {
  if (props.isCompanyView) {
    return '项目总体洞察'
  } else if (props.currentProject) {
    return props.currentProject.name
  }
  return '项目洞察'
})

const hasRisks = computed(() => projectRisks.value.length > 0)

// --- Context Switching Logic ---

function initContext() {
  messages.value = [] // Clear history on switch
  if (props.isCompanyView) {
    currentAnalysis.value = companyAnalysis
    currentSuggestions.value = [...companySuggestions]
    isAlternativeView.value = false // 公司视图：显示默认视图
  } else {
    const pName = props.currentProject ? props.currentProject.name : '未知项目'
    currentAnalysis.value = getProjectAnalysis(pName)
    currentSuggestions.value = [...projectSuggestions]
    isAlternativeView.value = true // 项目视图：默认显示新视图
  }
}

// Watch for context changes
watch([() => props.isCompanyView, () => props.currentProject], () => {
  initContext()
}, { immediate: true })


// --- Chat Logic ---

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function pushMsg(text, role){ 
  messages.value.push({ text, role })
  scrollToBottom()
}

function onSearch(){ 
  const v = (searchQuery.value || '').trim(); 
  if(!v) return; 
  pushMsg(v, 'user'); 
  searchQuery.value = ''; 
  showSuggestions.value = false; 
  setTimeout(() => reply(v), 400) 
}

function reply(text){
  const prefix = props.isCompanyView ? '【公司级回复】' : '【项目级回复】';
  const r = prefix + '已收到关于“' + text + '”的提问。系统正在分析相关数据...'; 
  pushMsg(r, 'ai') 
}

function selectSuggestion(text) {
  searchQuery.value = text;
  onSearch();
}

function handleBlur() {
  // Delay hiding to allow click events on suggestions to register
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}
</script>

<style scoped>
/* Main Layout */
.col-right { 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  overflow: hidden; 
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
}

/* Header */
.header-section {
  flex-shrink: 0;
  padding: 10px 16px;
  background: var(--card);
  z-index: 5;
  position: relative;
}

.header-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 5%;
  width: 90%;
  height: 1px;
  background-color: var(--border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.research-title { 
  font-size: 16px; 
  font-weight: 600; 
  color: var(--text); 
  margin: 0;
  border: none;
  padding: 0;
  background: transparent;
}

/* View Tabs - 简洁文字链接风格 */
.view-tabs {
  display: flex;
  align-items: center;
  gap: 0;
}

.tab-divider {
  color: #d1d5db;
  font-weight: 300;
  margin: 0 8px;
}

.tab-link {
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding: 4px 12px;
  white-space: nowrap;
  border-radius: 6px;
}

.tab-link:hover {
  color: #64748b;
  background: #f1f5f9;
}

.tab-link.active {
  color: #3b82f6;
  font-weight: 500;
  background: #eff6ff;
}

.risk-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}

/* Scrollable Middle Area */
.chat-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin; 
  scrollbar-color: var(--border) transparent;
}

.chat-content::-webkit-scrollbar {
  width: 6px;
}
.chat-content::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 3px;
}

/* Original Research Content Styles */
.research-content { 
  font-size: 13px; 
  line-height: 1.7; 
  color: var(--text); 
  padding: 2px 16px 16px; 
  letter-spacing: 0.1px; 
}
.research-content p { margin: 0 0 1.1em; }
.research-content p:last-child { margin-bottom: 0; }
.research-content strong { font-weight: 600; color: #1c2538; }
.research-content ul { list-style: none; padding-left: 0; margin: 1.1em 0; }
.research-content li { padding-left: 1.2em; position: relative; margin-bottom: 0.6em; }
.research-content li::before { content: '■'; position: absolute; left: 0; top: 0.1em; font-size: 0.7em; color: var(--accent); }

/* Risk View Styles */
.risk-view {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.risk-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  transition: all 0.2s;
  position: relative;
}

.risk-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.risk-card.high {
  border-left: 3px solid #ef4444;
}

.risk-card.medium {
  border-left: 3px solid #f97316;
}

.risk-card.low {
  border-left: 3px solid #eab308;
}

.risk-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.risk-level-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

.risk-level-badge.high {
  background: #fef2f2;
  color: #dc2626;
}

.risk-level-badge.medium {
  background: #fff7ed;
  color: #ea580c;
}

.risk-level-badge.low {
  background: #fefce8;
  color: #ca8a04;
}

.risk-category {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 3px 8px;
  border-radius: 4px;
}

.risk-section {
  margin-bottom: 10px;
}

.risk-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.risk-content {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
}

.risk-content.action {
  color: #15803d;
  font-weight: 500;
}

.risk-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.risk-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-label {
  color: var(--muted);
  font-weight: 500;
}

.meta-value {
  color: var(--text);
  font-weight: 600;
}

.meta-divider {
  color: #e2e8f0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #15803d;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-weight: 600;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 13px;
  color: var(--muted);
}

/* Dialogue/Message Styles */
.dialogue-container {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg {
  display: flex;
  max-width: 100%;
}

.msg.user {
  justify-content: flex-end;
}

.msg.ai {
  justify-content: flex-start;
}

.msg-content {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  max-width: 85%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.msg.ai .msg-content {
  background: #f3f4f6;
  color: var(--text);
  border-top-left-radius: 2px;
}

.msg.user .msg-content {
  background: var(--accent);
  color: #fff;
  border-top-right-radius: 2px;
}

/* Footer (Search) - New Integrated Design */
.ai-dialogue-section { 
  flex-shrink: 0;
  position: relative; 
  background: var(--card); 
  padding: 12px 16px; 
  border-top: none; 
}

.search-complex-wrapper {
  border: 2px solid var(--accent);
  border-radius: 26px; /* Matches the look of a rounded input */
  background: var(--bg);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(88, 158, 248, 0.1);
}

.search-complex-wrapper.is-expanded {
  border-radius: 16px; /* Slightly less rounded when expanded to look like a card */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
}

/* Suggestions Area */
.suggestions-area {
  padding: 8px 12px 4px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--card);
  max-height: 120px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.suggestions-header .title {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 4px;
}

.suggestion-item {
  font-size: 13px;
  color: var(--text);
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  background: var(--bg);
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

/* Input Area */
.input-area {
  display: flex;
  align-items: center;
  padding: 4px 6px 4px 16px; /* Right padding smaller for button */
  background: transparent;
}

/* Deep selector to override Element Plus Input styles */
:deep(.transparent-input .el-input__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  padding: 0;
}

:deep(.transparent-input .el-input__inner) {
  border: none !important;
  height: 36px;
}

.search-btn-round {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
}

.search-btn-round:hover {
  background: #4080e0; /* Darker accent */
}
</style>
