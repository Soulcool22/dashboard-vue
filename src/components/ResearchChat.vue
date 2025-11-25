<template>
  <section class="col col-right">
    <!-- Fixed Header -->
    <div class="header-section">
      <div class="header-content">
        <div class="switch-btn" @click="toggleView" v-if="!isCompanyView">
          <icon-switch theme="two-tone" size="22" :fill="['#15803d' ,'#ffffff']" :strokeWidth="3" strokeLinejoin="bevel"/>
        </div>
        <h3 class="research-title">{{ titleText }}</h3>
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

      <!-- 新视图：占位内容 -->
      <template v-else>
        <div class="alternative-view">
          <div class="placeholder-content">
            <h4>新视图</h4>
            <p>这里是切换后的全新视图内容区域</p>
            <p>可以在这里添加任何自定义内容</p>
          </div>
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
import { Up, Down, Switch } from '@icon-park/vue-next'

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
  <p><strong>公司整体运营分析：</strong>本季度所有在建项目总体进度偏差可控，平均完成率 78%。供应链稳定性有所提升，但跨项目资源调度仍存在 15% 的效率损耗。</p>
  <p><strong>关键风险识别：</strong>3 个项目处于黄色预警状态，主要集中在交付验收环节。建议加强公司级质量管控团队的介入。</p>
  <p><strong>资源概览：</strong>设计资源利用率 92%，开发资源利用率 88%。</p>
`

function getProjectAnalysis(projectName) {
  return `
    <p><strong>[${projectName}] 项目整体表现分析：</strong>本期里程碑总体提升 2.3 个百分点，主要得益于采购环节的优化和生产效率的提升。其中，设计阶段完成率达到 85%，超出预期目标。</p>
    <p><strong>资金回款分析：</strong>当前回款进度收回80%，采购环节平均延迟 3 天，预计影响兑现指数 0.8pp。主要原因为供应商交付周期延长，建议加强供应链缓冲管理，建立多供应商体系以降低单一依赖风险。</p>
    <p><strong>人力资源分析：</strong>当前人力投入与产出比为 1:1.2，建议将 20% 的资源重新分配至关键路径项目。跨部门协同效率提升 15%，但仍需加强评审机制。</p>
    <p><strong>下阶段重点关注：</strong></p>
    <ul>
      <li>供应链稳定性监控与应急预案制定</li>
      <li>关键里程碑节点的前置风险评估</li>
      <li>跨部门协同流程的标准化与优化</li>
      <li>资源配置的动态调整机制建立</li>
    </ul>
    <p><strong>预测与建议：</strong>基于当前趋势分析，预计下期兑现指数将达到 82-85%，建议提前部署缓冲资源，确保关键节点按时交付。</p>
  `
}

// --- Reactive State based on Context ---

const currentSuggestions = ref([...companySuggestions])
const currentAnalysis = ref(companyAnalysis)

const titleText = computed(() => {
  if (props.isCompanyView) {
    return '项目总体洞察'
  } else if (props.currentProject) {
    return `项目洞察：${props.currentProject.name}`
  }
  return '项目洞察'
})

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
  gap: 12px;
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

.switch-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.switch-btn:hover {
  background: rgba(21, 128, 61, 0.08);
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

/* Alternative View Styles */
.alternative-view {
  padding: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: var(--text);
}

.placeholder-content h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--accent);
}

.placeholder-content p {
  font-size: 14px;
  color: var(--muted);
  margin: 8px 0;
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
