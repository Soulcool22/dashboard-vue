<template>
  <div id="app-wrapper">
    <header>
      <div class="brand">
        <span>项目管理系统</span>
        <span class="badge">数据看板</span>
      </div>
    </header>
    <main :class="['layout', { 'left-expanded': expandedLeft }]">
      <section class="col col-left">
        <WatchList
          :projects="projects"
          :search-query="searchQuery"
          :all-projects="filteredAllProjects"
          :active-project="selectedProject"
          :is-expanded="expandedLeft"
          @toggle-left="toggleLeftExpand"
          @update:searchQuery="searchQuery = $event"
          @toggle-watch-status="toggleWatchStatus"
          @search-active-change="handleSearchActiveChange"
          @select-project="handleSelectProject"
        />
        <RegularList 
          v-if="!isSearchActive" 
          v-model="regularCollapsed" 
          :regulars="regulars" 
          :active-project="selectedProject"
          :is-expanded="expandedLeft"
          @select-project="handleSelectProject"
        />
      </section>
      <section class="col col-middle">
        <div class="fixed-header-wrapper">
          <!-- Navigation Breadcrumb -->
          <div class="nav-bar">
            <span 
              class="nav-item" 
              :class="{ 'link': !isCompanyView, 'all-active': isCompanyView }"
              @click="!isCompanyView ? showCompanyView() : null"
            >全部</span>
            <template v-if="!isCompanyView && selectedProject">
              <span class="nav-divider">/</span>
              <span 
                class="nav-item" 
                :class="{ 'link': selectedKpi, 'active': !selectedKpi }"
                @click="selectedKpi ? clearKpiSelection() : null"
              >{{ selectedProject.name }}</span>
              <template v-if="selectedKpi">
                <span class="nav-divider">/</span>
                <span class="nav-item active">{{ selectedKpi }}</span>
              </template>
            </template>
          </div>

          <!-- View Title Bar -->
          <div class="middle-header" v-if="!isCompanyView && selectedProject">
            <div class="project-info">
              <div class="project-main-title">{{ selectedProject.name }}</div>
              <div class="project-index-row">
                <div class="project-index-value">{{ lastValue(selectedProject).toFixed(2) }}</div>
                <div class="project-index-label">进度兑现指数</div>
                <div class="project-index-change" :class="deltaSign(selectedProject) >= 0 ? 'up' : 'down'">{{ deltaText(selectedProject) }}</div>
              </div>
            </div>
          </div>

          <!-- Company View Header (Fixed) -->
          <div v-if="isCompanyView" class="company-header-group">
            <div class="dashboard-header">
              <div class="header-title">
                <span>项目态势总览</span>
              </div>
              <div class="header-meta">
                <span class="meta-item">统计周期：2025 Q4</span>
                <span class="meta-divider">|</span>
                <span class="meta-item">更新于 14:30</span>
              </div>
            </div>

            <div class="region-nav" style="margin-top: 12px;">
              <div 
                v-for="region in regions" 
                :key="region" 
                class="nav-pill" 
                :class="{ active: companyRegion === region }"
                @click="companyRegion = region"
              >
                {{ region }}
              </div>
            </div>
          </div>
        </div>

        <div class="scroll-content">
          <!-- View Content -->
          <template v-if="!isCompanyView">
            <KpiGrid :kpis="kpis" :selected-kpi="selectedKpi" @select-kpi="handleSelectKpi" />
            <div class="chart-card-container">
              <KpiPanel 
                :selected-kpi="selectedKpi" 
                :is-overview="isChartOverview"
                :project-series="selectedProject?.series"
                :completion-series="selectedProject?.completionSeries"
                @stats-changed="updateKpiFromChart"
              />
            </div>
            <!-- 根据是否选中 KPI 卡片来决定显示归因分析还是项目更新 -->
            <AttributionAnalysis 
              v-if="selectedKpi && selectedKpi !== '资金到账率' && selectedKpi !== '项目支出金额'" 
              :selected-kpi="selectedKpi"
              :metrics="kpiLiveMetrics"
              :compare-mode="kpiLiveCompareMode"
              class="updates-container"
            />
            <ProjectUpdates 
              v-else-if="!selectedKpi"
              class="updates-container" 
            />
          </template>
          <div v-else class="company-view-placeholder">
            <CompanyDashboard 
              :current-region="companyRegion"
              @select-project-name="selectProjectByName" 
            />
          </div>
        </div>
      </section>
      <ResearchChat 
        :is-company-view="isCompanyView"
        :current-project="selectedProject"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import WatchList from './components/WatchList.vue'
import RegularList from './components/RegularList.vue'
import KpiGrid from './components/KpiGrid.vue'
import KpiPanel from './components/KpiPanel.vue'
import ResearchChat from './components/ResearchChat.vue'
import ProjectUpdates from './components/ProjectUpdates.vue'
import AttributionAnalysis from './components/AttributionAnalysis.vue'
import CompanyDashboard from './components/CompanyDashboard.vue'
import { urumqiAllTasks } from './data/urumqiTasks.js'

const expandedLeft = ref(false)
const regularCollapsed = ref(false)
function toggleLeftExpand(){ expandedLeft.value = !expandedLeft.value }

// --- Data State ---
const companyRegion = ref('全国')
const regions = ['全国', '华东', '华南', '华北', '西部', '广东', '海外']
const projects = ref([])
function generateSeriesData() {
  const data = [];
  // 简单直线：从60%到90%
  for (let i = 0; i < 60; i++) {
    const value = 60 + (30 * i / 59);
    data.push(Math.round(value));
  }
  return data;
}
// =====================================================
// 重庆江北项目完整数据 - 从CSV导入（排除项目收款）
// =====================================================

// 所有任务数据（完整导入CSV，排除项目收款相关）
const chongqingJiangbeiAllTasks = [
  // ========== 启动阶段 ==========
  { id: '1', wbs: '1', name: '项目启动', level: 2, phase: '启动阶段', responsible: '彭高红', executor: '彭高红', status: '已完成', planStart: '2025-12-01', planEnd: '2025-12-05', planDuration: 5, actualStart: null, actualEnd: '2025-12-09', actualDuration: null },
  { id: '1.1', wbs: '1.1', name: '项目启动', level: 3, phase: '启动阶段', responsible: '彭高红', executor: '彭高红', status: '逾期完成', planStart: '2025-12-01', planEnd: '2025-12-05', planDuration: 5, actualStart: null, actualEnd: '2025-12-09', actualDuration: null },
  { id: '1.2', wbs: '1.2', name: '项目情况基准摸底', level: 3, phase: '启动阶段', responsible: '彭高红', executor: '彭高红', status: '逾期完成', planStart: '2025-12-01', planEnd: '2025-12-05', planDuration: 5, actualStart: null, actualEnd: '2025-12-09', actualDuration: null },
  { id: '1.3', wbs: '1.3', name: '召开项目启动会', level: 3, phase: '启动阶段', responsible: '彭高红', executor: '彭高红', status: '逾期完成', planStart: '2025-12-01', planEnd: '2025-12-05', planDuration: 5, actualStart: null, actualEnd: '2025-12-09', actualDuration: null },
  
  // ========== 准备阶段 - 交付准备 ==========
  { id: '2', wbs: '2', name: '交付准备', level: 2, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '2.1', wbs: '2.1', name: '合同签订', level: 3, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '2.2', wbs: '2.2', name: '外部启动会召开', level: 3, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '2.2.1', wbs: '2.2.1', name: '甲方会前方案对接', level: 4, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '2.2.2', wbs: '2.2.2', name: '业务（实际使用方）单位会前方案对接', level: 4, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 准备阶段 - 深化设计 ==========
  { id: '3', wbs: '3', name: '深化设计', level: 2, phase: '准备阶段', responsible: '张同永', executor: '杨智', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.1', wbs: '3.1', name: '深化工作评估', level: 3, phase: '准备阶段', responsible: '张同永', executor: '杨智', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.2', wbs: '3.2', name: '深化方案设计', level: 3, phase: '准备阶段', responsible: '张同永', executor: '杨智', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.3', wbs: '3.3', name: '自制产品深化', level: 3, phase: '准备阶段', responsible: '穆晓亮', executor: '杨智', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4', wbs: '3.4', name: '深化清单编制及下单(含计划员下单)', level: 3, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.1', wbs: '3.4.1.1', name: '电气工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.2', wbs: '3.4.1.2', name: '空调工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.3', wbs: '3.4.1.3', name: '海关监管设施设备工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.4', wbs: '3.4.1.4', name: '边检设施设备工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.5', wbs: '3.4.1.5', name: '安检设施设备工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '进行中', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.6', wbs: '3.4.1.6', name: '卫检设备工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '3.4.1.7', wbs: '3.4.1.7', name: '土建工程', level: 4, phase: '准备阶段', responsible: '张同永', executor: '郑富兰', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 准备阶段 - 采购准备 ==========
  { id: '4', wbs: '4', name: '采购准备', level: 2, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2', wbs: '4.2', name: '外购产品采购及发到货（采购）', level: 3, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2.1.1', wbs: '4.2.1.1', name: '电气工程采购', level: 4, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-22', planDuration: 18, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2.1.2', wbs: '4.2.1.2', name: '空调工程采购', level: 4, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-22', planDuration: 18, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2.1.3', wbs: '4.2.1.3', name: '海关监管设施设备工程采购', level: 4, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2.1.4', wbs: '4.2.1.4', name: '边检设施设备工程采购', level: 4, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2.1.5', wbs: '4.2.1.5', name: '卫检设备工程采购', level: 4, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.2.1.6', wbs: '4.2.1.6', name: '土建工程采购', level: 4, phase: '准备阶段', responsible: '王妙燕', executor: '', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.3', wbs: '4.3', name: '自制产品生产及发到货（生产）', level: 3, phase: '准备阶段', responsible: '谢佳友', executor: '陈涛', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.3.1.1', wbs: '4.3.1.1', name: '海关监管设施设备工程生产', level: 4, phase: '准备阶段', responsible: '谢佳友', executor: '陈涛', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.3.1.2', wbs: '4.3.1.2', name: '边检设施设备工程生产', level: 4, phase: '准备阶段', responsible: '谢佳友', executor: '陈涛', status: '延期', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.3.1.3', wbs: '4.3.1.3', name: '卫检设备工程生产', level: 4, phase: '准备阶段', responsible: '谢佳友', executor: '陈涛', status: '进行中', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '4.3.1.4', wbs: '4.3.1.4', name: '土建工程生产', level: 4, phase: '准备阶段', responsible: '谢佳友', executor: '陈涛', status: '延期', planStart: '2025-12-05', planEnd: '2025-12-31', planDuration: 27, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 准备阶段 - 劳务准备 ==========
  { id: '5', wbs: '5', name: '劳务准备', level: 2, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '5.1', wbs: '5.1', name: '劳务工程量预估', level: 3, phase: '准备阶段', responsible: '魏新建', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-07', planDuration: 3, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '5.2', wbs: '5.2', name: '劳务申请及合同签订', level: 3, phase: '准备阶段', responsible: '魏新建', executor: '金慧慧', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-08', planDuration: 4, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '5.3', wbs: '5.3', name: '进场施工手续办理', level: 3, phase: '准备阶段', responsible: '彭高红', executor: '彭高红', status: '逾期', planStart: '2025-12-05', planEnd: '2025-12-10', planDuration: 6, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 实施阶段 - 软件开发 ==========
  { id: '6', wbs: '6', name: '软件开发（开发）', level: 2, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.1', wbs: '6.1.1.1', name: '卫生检疫及行李查验', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.2', wbs: '6.1.1.2', name: '入境托运行李先期机检系统', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.3', wbs: '6.1.1.3', name: '智能行李拦截服务平台', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.4', wbs: '6.1.1.4', name: '集中审图系统升级', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.5', wbs: '6.1.1.5', name: '信息发布系统', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '延期', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.6', wbs: '6.1.1.6', name: '远程查验系统', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.7', wbs: '6.1.1.7', name: '海关智能库管系统', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.1.8', wbs: '6.1.1.8', name: '系统整体调试', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.2', wbs: '6.1.2', name: '边检设施设备工程软件', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '延期', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.3', wbs: '6.1.3', name: '卫检设备工程软件', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '6.1.4', wbs: '6.1.4', name: '土建工程软件', level: 4, phase: '实施阶段', responsible: '胡军会', executor: '董显浩', status: '延期', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 实施阶段 - 现场施工及安装调试 ==========
  { id: '7', wbs: '7', name: '现场施工及安装调试（施工）', level: 2, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.1', wbs: '7.1.1', name: '电气工程施工', level: 4, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-26', planDuration: 26, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.2', wbs: '7.1.2', name: '空调工程施工', level: 4, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.3', wbs: '7.1.3', name: '海关监管设施设备工程施工', level: 4, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.4', wbs: '7.1.4', name: '边检设施设备工程施工', level: 4, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.5', wbs: '7.1.5', name: '安检设施设备工程施工', level: 4, phase: '实施阶段', responsible: '', executor: '', status: '进行中', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.6', wbs: '7.1.6', name: '卫检设备工程施工', level: 4, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '7.1.7', wbs: '7.1.7', name: '土建工程施工', level: 4, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 实施阶段 - 部署联调 ==========
  { id: '8', wbs: '8', name: '项目部署联调', level: 2, phase: '实施阶段', responsible: '彭高红', executor: '彭高红', status: '延期', planStart: '2025-12-01', planEnd: '2025-12-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 收尾阶段 - 试运行 ==========
  { id: '9', wbs: '9', name: '项目试运行', level: 2, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-01-01', planEnd: '2026-03-01', planDuration: 60, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '9.1', wbs: '9.1', name: '系统部署', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-01-01', planEnd: '2026-03-01', planDuration: 60, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '9.2', wbs: '9.2', name: '功能测试', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-01-01', planEnd: '2026-03-01', planDuration: 60, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '9.3', wbs: '9.3', name: '用户培训', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-01-01', planEnd: '2026-03-01', planDuration: 60, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '9.4', wbs: '9.4', name: '验收准备', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-01-01', planEnd: '2026-03-01', planDuration: 60, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 收尾阶段 - 培训 ==========
  { id: '10', wbs: '10', name: '项目培训', level: 2, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-01-01', planEnd: '2026-02-12', planDuration: 43, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '10.1', wbs: '10.1', name: '项目软件产品培训', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '董显浩', status: '未开始', planStart: '2026-02-01', planEnd: '2026-02-12', planDuration: 12, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '10.2', wbs: '10.2', name: '项目外购产品培训', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-02-01', planEnd: '2026-02-12', planDuration: 12, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '10.3', wbs: '10.3', name: '项目自制产品培训', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-02-01', planEnd: '2026-02-12', planDuration: 12, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 收尾阶段 - 验收 ==========
  { id: '11', wbs: '11', name: '项目验收', level: 2, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.1', wbs: '11.1', name: '劳务工程验收', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.2', wbs: '11.2', name: '现场竣工验收', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.2.1', wbs: '11.2.1', name: '预验收', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.2.2', wbs: '11.2.2', name: '初验', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.2.3', wbs: '11.2.3', name: '终验', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.3', wbs: '11.3', name: '验收问题整改', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '进行中', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.3.1', wbs: '11.3.1', name: '问题清单确认', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.3.2', wbs: '11.3.2', name: '整改方案制定', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.3.3', wbs: '11.3.3', name: '整改实施', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '11.3.4', wbs: '11.3.4', name: '整改复验', level: 4, phase: '收尾阶段', responsible: '', executor: '', status: '逾期', planStart: null, planEnd: null, planDuration: null, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 收尾阶段 - 移交归档 ==========
  { id: '12', wbs: '12', name: '项目移交归档', level: 2, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.1', wbs: '12.1', name: '外部单位资料移交', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.1.1', wbs: '12.1.1', name: '产品使用手册', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.1.2', wbs: '12.1.2', name: '设备记录表', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.1.3', wbs: '12.1.3', name: '运行后维护对接方式', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.2', wbs: '12.2', name: '售后维护内部移交', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.2.1', wbs: '12.2.1', name: '竣工图纸', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.2.2', wbs: '12.2.2', name: '结算清单', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.2.3', wbs: '12.2.3', name: '设备记录表', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.2.4', wbs: '12.2.4', name: '运行期间客户联系对接人', level: 4, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  { id: '12.3', wbs: '12.3', name: '公司资产内部移交', level: 3, phase: '收尾阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-03-01', planEnd: '2026-03-31', planDuration: 31, actualStart: null, actualEnd: null, actualDuration: null },
  
  // ========== 审计阶段 ==========
  { id: '13', wbs: '13', name: '项目结算审计', level: 2, phase: '审计阶段', responsible: '彭高红', executor: '彭高红', status: '未开始', planStart: '2026-04-01', planEnd: '2026-04-30', planDuration: 30, actualStart: null, actualEnd: null, actualDuration: null }
]

// 计算任务统计数据
function calculateTaskStats(tasks) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === '已完成' || t.status === '逾期完成').length
  const overdue = tasks.filter(t => t.status === '逾期').length
  const delayed = tasks.filter(t => t.status === '延期').length
  const inProgress = tasks.filter(t => t.status === '进行中').length
  const pending = tasks.filter(t => t.status === '未开始').length
  
  // 计算任务完成率：已完成任务数 / 总任务数
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  
  // 计算截止今天应该完成的任务数（planEnd <= 今天）
  const today = new Date('2025-12-11') // 使用当前日期
  const shouldBeCompleted = tasks.filter(t => {
    if (!t.planEnd) return false
    return new Date(t.planEnd) <= today
  }).length
  
  // 计算较计划完成率：已完成 / 应完成
  // 如果应完成数为0，说明还没到任何任务的截止日期
  const planCompletionRate = shouldBeCompleted > 0 ? Math.round((completed / shouldBeCompleted) * 100) : 100
  
  // 计算与计划的差值（用于显示 "较计划 ↓ X%"）
  // planDelta = 实际完成率 - 计划完成率(100%)
  // 例如：应完成20个，实际完成4个，完成率=20%，较计划=-80%
  const actualVsPlan = shouldBeCompleted > 0 ? Math.round((completed / shouldBeCompleted) * 100) : 100
  const planDelta = actualVsPlan - 100 // 与100%计划的差距
  
  // 计算逾期任务率（逾期+延期 占 应完成任务的比例）
  const overdueRate = shouldBeCompleted > 0 ? Math.round(((overdue) / shouldBeCompleted) * 100) : 0
  
  // 计算延期任务率
  const delayedRate = total > 0 ? Math.round((delayed / total) * 100) : 0
  
  return {
    total,
    completed,
    overdue,
    delayed,
    inProgress,
    pending,
    completionRate,      // 总完成率
    planCompletionRate,  // 较计划完成率
    planDelta,           // 与计划差值（负数表示落后）
    overdueRate,         // 逾期率
    delayedRate,         // 延期率
    shouldBeCompleted,   // 应完成任务数
    actualVsPlan         // 实际vs计划完成率
  }
}

function parseDateStrict(str) {
  if (!str || typeof str !== 'string') return null
  const parts = str.split('-')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildCompletionSeries(tasks) {
  if (!tasks || !tasks.length) {
    return { dates: [], planCounts: [], actualCounts: [], planRates: [], actualRates: [], totalTasks: 0 }
  }

  const totalTasks = tasks.length
  const planCountsMap = {}
  const actualCountsMap = {}

  let minDate = null
  let maxDate = null

  tasks.forEach(task => {
    const planDate = parseDateStrict(task.planEnd)
    if (planDate) {
      const key = formatDateKey(planDate)
      planCountsMap[key] = (planCountsMap[key] || 0) + 1
      if (!minDate || planDate < minDate) minDate = planDate
      if (!maxDate || planDate > maxDate) maxDate = planDate
    }

    const actualDate = parseDateStrict(task.actualEnd)
    if (actualDate) {
      const key = formatDateKey(actualDate)
      actualCountsMap[key] = (actualCountsMap[key] || 0) + 1
      if (!minDate || actualDate < minDate) minDate = actualDate
      if (!maxDate || actualDate > maxDate) maxDate = actualDate
    }
  })

  if (!minDate || !maxDate) {
    return { dates: [], planCounts: [], actualCounts: [], planRates: [], actualRates: [], totalTasks }
  }

  const dates = []
  const planCounts = []
  const actualCounts = []
  const planRates = []
  const actualRates = []

  let planCum = 0
  let actualCum = 0

  for (let cursor = new Date(minDate); cursor <= maxDate; cursor.setDate(cursor.getDate() + 1)) {
    const key = formatDateKey(cursor)
    dates.push(key)
    planCum += planCountsMap[key] || 0
    actualCum += actualCountsMap[key] || 0
    planCounts.push(planCum)
    actualCounts.push(actualCum)
    planRates.push(totalTasks ? Number((planCum / totalTasks).toFixed(4)) : 0)
    actualRates.push(totalTasks ? Number((actualCum / totalTasks).toFixed(4)) : 0)
  }

  return { dates, planCounts, actualCounts, planRates, actualRates, totalTasks }
}

// 生成重庆江北项目的进度兑现指数序列（直线）
function generateChongqingSeriesData() {
  const data = [];
  // 直线：从75%到65%（体现进度压力）
  for (let i = 0; i < 60; i++) {
    const value = 75 - (10 * i / 59);
    data.push(Math.round(value));
  }
  return data;
}

// 计算重庆江北项目的任务统计
const chongqingStats = calculateTaskStats(chongqingJiangbeiAllTasks)
const chongqingCompletionSeries = buildCompletionSeries(chongqingJiangbeiAllTasks)

// =====================================================
// 乌鲁木齐项目完整数据 - 从外部文件导入（真实数据 v2）
// 数据来源: src/data/urumqiTasks.js (223条任务)
// =====================================================
// urumqiAllTasks 已通过 import 导入

// 计算乌鲁木齐项目的任务统计
const urumqiStats = calculateTaskStats(urumqiAllTasks)
const urumqiCompletionSeries = buildCompletionSeries(urumqiAllTasks)

// 生成乌鲁木齐项目的进度兑现指数序列（直线）
function generateUrumqiSeriesData() {
  const data = [];
  // 直线：从85%到70%（体现进度落后）
  for (let i = 0; i < 60; i++) {
    const value = 85 - (15 * i / 59);
    data.push(Math.round(value));
  }
  return data;
}

const regulars = ref([
  // 重庆江北项目 - 真实数据（从CSV完整导入）
  { 
    name: '重庆江北', 
    sector: '彭高红', 
    series: generateChongqingSeriesData(),
    completionSeries: chongqingCompletionSeries,
    allTasks: chongqingJiangbeiAllTasks,
    taskStats: chongqingStats,
    projectInfo: {
      fullName: '重庆江北国际机场T3B航站楼及第四跑道工程T3A航站楼联检设施改造工程',
      planStartDate: '2025-12-01',
      planCompleteDate: '2026-04-30',
      currentPhase: '实施阶段',
      // 使用真实计算的统计数据
      totalTasks: chongqingStats.total,
      completedTasks: chongqingStats.completed,
      overdueTasks: chongqingStats.overdue,
      delayedTasks: chongqingStats.delayed,
      inProgressTasks: chongqingStats.inProgress,
      pendingTasks: chongqingStats.pending,
      // KPI指标
      taskCompletionRate: chongqingStats.completionRate,  // 任务完成率
      planCompletionRate: chongqingStats.planCompletionRate, // 较计划完成率
      overdueRate: chongqingStats.overdueRate, // 逾期任务率
      shouldBeCompleted: chongqingStats.shouldBeCompleted // 截止今天应完成任务数
    },
    // 项目KPI（基于真实数据计算）
    kpiData: {
      taskCompletionRate: {
        value: chongqingStats.completionRate,
        planValue: chongqingStats.planCompletionRate,
        delta: chongqingStats.completionRate - chongqingStats.planCompletionRate,
        trend: chongqingStats.completionRate >= chongqingStats.planCompletionRate ? 'up' : 'down'
      },
      overdueRate: {
        value: chongqingStats.overdueRate,
        threshold: 10, // 预警阈值10%
        isWarning: chongqingStats.overdueRate > 10
      }
    },
    risks: [
      {
        level: 'high',
        levelText: '高风险',
        category: '进度延误',
        reason: '深化设计阶段多项任务逾期（12项），影响后续采购和施工',
        action: '加快深化设计评审，并行推进采购准备',
        impact: '可能影响整体交付时间 10-15 天',
        deadline: '2025-12-15'
      },
      {
        level: 'high',
        levelText: '高风险',
        category: '劳务准备',
        reason: '劳务工程量预估、合同签订、进场施工手续办理均已逾期',
        action: '加急完成劳务合同签订，同步办理进场手续',
        impact: '现场施工启动延迟',
        deadline: '2025-12-12'
      },
      {
        level: 'medium',
        levelText: '中风险',
        category: '采购风险',
        reason: '部分设备采购周期较长，需提前锁定供应商',
        action: '优先确认长周期设备清单，提前下单',
        impact: '设备到货可能影响安装进度',
        deadline: '2025-12-20'
      },
      {
        level: 'medium',
        levelText: '中风险',
        category: '软件开发',
        reason: '信息发布系统、边检软件、土建软件状态为延期',
        action: '增加开发资源，优先处理延期模块',
        impact: '影响系统联调进度',
        deadline: '2025-12-25'
      }
    ]
  },
  { 
    name: '乌鲁木齐', 
    sector: '潘勇', 
    series: generateUrumqiSeriesData(),
    completionSeries: urumqiCompletionSeries,
    allTasks: urumqiAllTasks,
    taskStats: urumqiStats,
    projectInfo: {
      fullName: '乌鲁木齐地窝堡国际机场T4航站楼边检设施改造工程',
      planStartDate: '2025-08-28',
      planCompleteDate: '2025-12-31',
      currentPhase: '实施阶段',
      totalTasks: urumqiStats.total,
      completedTasks: urumqiStats.completed,
      overdueTasks: urumqiStats.overdue,
      delayedTasks: urumqiStats.delayed,
      inProgressTasks: urumqiStats.inProgress,
      pendingTasks: urumqiStats.pending,
      taskCompletionRate: urumqiStats.completionRate,
      planCompletionRate: urumqiStats.planCompletionRate,
      overdueRate: urumqiStats.overdueRate,
      shouldBeCompleted: urumqiStats.shouldBeCompleted
    },
    kpiData: {
      taskCompletionRate: {
        value: urumqiStats.completionRate,
        planValue: urumqiStats.planCompletionRate,
        delta: urumqiStats.completionRate - urumqiStats.planCompletionRate,
        trend: urumqiStats.completionRate >= urumqiStats.planCompletionRate ? 'up' : 'down'
      },
      overdueRate: {
        value: urumqiStats.overdueRate,
        threshold: 10,
        isWarning: urumqiStats.overdueRate > 10
      }
    },
    risks: [
      {
        level: 'high',
        levelText: '高风险',
        category: '第三方检测整改',
        reason: '001出入境旅客查验系统、002边检勤务指挥中心多项功能逾期未完成',
        action: '协调厂家加快调试进度，优先处理核心功能',
        impact: '影响项目验收进度',
        deadline: '2025-12-20'
      },
      {
        level: 'high',
        levelText: '高风险',
        category: '设备采购',
        reason: '部分设备（windows server、麒麟V10、会议系统）采购逾期',
        action: '加急推进采购流程，协调供应商优先发货',
        impact: '影响系统部署和联调',
        deadline: '2025-12-15'
      },
      {
        level: 'medium',
        levelText: '中风险',
        category: '门禁系统',
        reason: '访客管理、微信双网摆渡、外网环境等功能逾期',
        action: '请海康厂家进场整改',
        impact: '影响门禁系统完整性验收',
        deadline: '2025-12-25'
      }
    ]
  }
])
// KPI数据 - 当选择重庆江北项目时会使用真实数据
const kpis = ref([
  { title: '资金到账率', value: '0%', delta: '', up: true },
  { title: '任务完成率', value: '78%', delta: '+2%', up: true },
  { title: '项目支出金额', value: '¥ 0', delta: '', up: true },
  { title: '人员健康度', value: '0%', delta: '', up: true },
  { title: '逾期任务率', value: '22%', delta: '-1%', up: true }
])

// 当选择项目时更新KPI数据
function updateKpisForProject(project) {
  if (project && project.taskStats) {
    const stats = project.taskStats
    // 更新任务完成率
    const taskKpiIdx = kpis.value.findIndex(k => k.title === '任务完成率')
    if (taskKpiIdx !== -1) {
      const actualRate = stats.actualVsPlan
      const delta = stats.planDelta
      kpis.value[taskKpiIdx] = {
        title: '任务完成率',
        value: actualRate + '%',
        delta: (delta >= 0 ? '+' : '') + delta + '%',
        up: delta >= 0
      }
    }
    // 更新逾期任务率
    const overdueKpiIdx = kpis.value.findIndex(k => k.title === '逾期任务率')
    if (overdueKpiIdx !== -1) {
      kpis.value[overdueKpiIdx] = {
        title: '逾期任务率',
        value: stats.overdueRate + '%',
        delta: stats.overdueRate > 10 ? '+' + (stats.overdueRate - 10) + '%' : '-' + (10 - stats.overdueRate) + '%',
        up: stats.overdueRate <= 10
      }
    }
    // 强制触发响应式更新
    kpis.value = [...kpis.value]
  } else {
    // 没有真实数据的项目，使用默认值
    const taskKpiIdx = kpis.value.findIndex(k => k.title === '任务完成率')
    if (taskKpiIdx !== -1) {
      kpis.value[taskKpiIdx] = { title: '任务完成率', value: '0%', delta: '', up: true }
    }
    const overdueKpiIdx = kpis.value.findIndex(k => k.title === '逾期任务率')
    if (overdueKpiIdx !== -1) {
      kpis.value[overdueKpiIdx] = { title: '逾期任务率', value: '0%', delta: '', up: true }
    }
    kpis.value = [...kpis.value]
  }
}

const kpiLiveMetrics = ref(null)
const kpiLiveCompareMode = ref('')

// --- View State ---
const isCompanyView = ref(true) // Show company view by default
const isChartOverview = ref(false) // Track if we are in project overview mode (enlarged sparkline)
const selectedProject = ref(null)
const selectedKpi = ref(null) // null when in overview mode, KPI title when in KPI mode

function handleSelectKpi(kpi) {
  // Toggle: if clicking already selected KPI, return to overview
  if (selectedKpi.value === kpi.title) {
    selectedKpi.value = null
    isChartOverview.value = true
  } else {
    selectedKpi.value = kpi.title
    isChartOverview.value = false // Switch to specific KPI view
  }
}

// --- Search and Filter Logic ---
const searchQuery = ref('')
const isSearchActive = ref(false)
const allProjects = computed(() => {
  const watched = projects.value.map(p => ({ ...p, isWatched: true }))
  const unWatched = regulars.value.map(p => ({ ...p, isWatched: false }))
  return [...watched, ...unWatched]
})
const filteredAllProjects = computed(() => {
  if (!searchQuery.value) return allProjects.value
  return allProjects.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
function handleSearchActiveChange(isActive) {
  isSearchActive.value = isActive
  if (!isActive) {
    searchQuery.value = ''
  }
}
function toggleWatchStatus(projectToToggle) {
  const indexInProjects = projects.value.findIndex(p => p.name === projectToToggle.name)
  if (indexInProjects !== -1) {
    const [removed] = projects.value.splice(indexInProjects, 1)
    regulars.value.unshift(removed)
  } else {
    const indexInRegulars = regulars.value.findIndex(p => p.name === projectToToggle.name)
    if (indexInRegulars !== -1) {
      const [added] = regulars.value.splice(indexInRegulars, 1)
      projects.value.push(added)
    }
  }
}

function selectProjectByName(name) {
  const p = projects.value.find(p => p.name === name) || regulars.value.find(p => p.name === name)
  if (p) {
    selectedProject.value = p
    isCompanyView.value = false
    isChartOverview.value = true
    selectedKpi.value = null
    updateKpisForProject(p)
  }
}

function updateKpiFromChart(payload){
  // 在概览模式下，不更新KPI卡片数据
  if (payload.isOverview) return
  if (!selectedKpi.value) return
  
  // 如果当前项目有真实任务数据，不要覆盖任务完成率和逾期任务率
  if (selectedProject.value?.taskStats) {
    if (selectedKpi.value === '任务完成率' || selectedKpi.value === '逾期任务率') {
      const idx = kpis.value.findIndex(k => k.title === selectedKpi.value)
      if (idx !== -1) {
        kpiLiveMetrics.value = { value: kpis.value[idx].value, delta: kpis.value[idx].delta, up: kpis.value[idx].up }
        kpiLiveCompareMode.value = '较计划'
      }
      return
    }
  }
  
  const idx = kpis.value.findIndex(k => k.title === selectedKpi.value)
  if (idx === -1) return
  // 项目支出金额：卡片显示实际支出金额，来源于图表数据
  if (selectedKpi.value === '项目支出金额') {
    const amt = Math.round(payload.amount || 0)
    const formatted = '¥ ' + new Intl.NumberFormat('en-US').format(amt)
    const updated = { ...kpis.value[idx], value: formatted }
    kpis.value.splice(idx, 1, updated)
    kpiLiveMetrics.value = { value: updated.value }
    kpiLiveCompareMode.value = ''
    return
  }

  const lastPct = Math.round((payload.last || 0) * 100)
  let up = payload.isUp
  let deltaPct = 0
  if (selectedKpi.value === '关键里程碑达成率' || selectedKpi.value === '任务完成率') {
    if (payload.planLast != null) {
      deltaPct = Math.abs(Math.round((payload.last - payload.planLast) * 100))
      up = (payload.last - payload.planLast) >= 0
    } else {
      deltaPct = Math.abs(Math.round((payload.last - (payload.prev || payload.last)) * 100))
      up = (payload.prev != null) ? (payload.last - payload.prev) >= 0 : up
    }
    kpiLiveCompareMode.value = '较计划'
  } else {
    deltaPct = Math.abs(Math.round((payload.last - (payload.prev || payload.last)) * 100))
    up = (payload.prev != null) ? (payload.last - payload.prev) >= 0 : up
    kpiLiveCompareMode.value = '环比'
  }
  const updated = { ...kpis.value[idx], value: lastPct + '%', delta: deltaPct + '%', up }
  kpis.value.splice(idx, 1, updated)
  kpiLiveMetrics.value = { value: updated.value, delta: updated.delta, up: updated.up }
}

// --- Selection and View Logic ---
onMounted(() => {
  // No project selected by default, showing company view
})
function handleSelectProject(project) {
  selectedProject.value = project
  isCompanyView.value = false // Switch to project view
  isChartOverview.value = true // Default to overview mode when project is selected
  selectedKpi.value = null // No KPI selected in overview mode (prevents highlight)
  // 更新KPI数据为选中项目的真实数据
  updateKpisForProject(project)
}
function showCompanyView() {
  isCompanyView.value = true
  selectedProject.value = null // Deselect project
  isChartOverview.value = false
}
function clearKpiSelection() {
  selectedKpi.value = null
  isChartOverview.value = true
}

// Helper functions
function lastValue(p){ if(!p || !p.series) return 0; const a=p.series; return a[a.length-1] }
function deltaSign(p){ if(!p || !p.series || p.series.length < 2) return 0; const a=p.series; return a[a.length-1]-a[a.length-2] }
function deltaText(p){ if(!p || !p.series || p.series.length < 2) return ''; const a=p.series; const prev=a[a.length-2]; const last=a[a.length-1]; const pct=prev?(((last-prev)/prev)*100).toFixed(2):'0.00'; const s=(last-prev)>=0?'↑ ':'↓ '; return s+Math.abs(pct)+'%'
}
</script>

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.layout {
  flex-grow: 1;
  overflow: hidden;
}
.middle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 8px;
}
.home-btn {
  height: 32px;
  width: 32px;
}
.project-info { display: flex; flex-direction: column; gap: 2px; padding: 0; }
.project-main-title { font-size: 20px; font-weight: 700; }
.project-index-row { display: flex; align-items: baseline; gap: 6px; }
.project-index-value { font-size: 22px; font-weight: 700; }
.project-index-label { font-size: 12px; color: var(--muted); }
.project-index-change { font-size: 12px; }
.project-index-change.up { color: var(--up); }
.project-index-change.down { color: var(--down); }

/* Breadcrumb Nav Styles */
.nav-bar {
  padding: 2px 0 2px 0;
  font-size: 13px;
  color: var(--muted);
  display: flex;
  align-items: center;
}
.nav-item {
  transition: color 0.2s;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.2;
}
.nav-item.link {
  cursor: pointer;
  color: var(--accent);
  font-weight: 600;
}
.nav-item.link:hover {
  color: var(--accent);
}
.nav-item.active {
  color: var(--text);
  font-weight: 500;
}
.nav-item.all-active {
  color: var(--text);
  font-weight: 600;
}
.nav-divider {
  margin: 0 8px;
  color: var(--muted);
}
</style>
