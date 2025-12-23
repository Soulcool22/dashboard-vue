# Dashboard-Vue

基于 Vue 3 + Element Plus 的工程项目数据看板，用于可视化展示关键绩效指标（KPI），包括任务完成率、逾期任务、人员健康度等维度。

## 🛠 技术栈

- **核心框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **图表库**: Apache ECharts
- **图标库**: IconPark
- **测试框架**: Vitest

## 📂 项目结构

```
dashboard-vue/
├── .kiro/specs/           # 功能规格文档
├── conductor/             # 项目规范与指南
├── test_data/             # 本地测试数据 (CSV)
│   ├── template_test.csv       # 任务数据
│   ├── template_test_people.csv # 人员数据
│   └── template_test_fund.csv   # 资金数据（预留）
├── tests/                 # 测试文件
│   ├── components/             # 组件测试
│   ├── config/                 # 配置测试
│   └── services/               # 服务测试
├── src/
│   ├── config/            # 配置管理
│   │   └── index.js       # 集中配置（区域、KPI、阈值）
│   ├── services/          # 数据服务层
│   │   ├── dataService.js      # 数据服务接口（适配器模式）
│   │   ├── dataTypes.js        # 数据类型定义
│   │   ├── errorHandler.js     # 错误处理
│   │   └── adapters/
│   │       └── csvAdapter.js   # CSV数据适配器
│   ├── utils/             # 工具函数
│   │   ├── formatters.js       # 格式化函数
│   │   ├── calculators.js      # 计算函数
│   │   ├── dateHelpers.js      # 日期辅助函数
│   │   └── index.js            # 统一导出
│   ├── components/        # Vue 组件
│   │   ├── kpi/                # KPI 详情视图组件
│   │   │   ├── BaseChartMixin.js
│   │   │   ├── FundArrivalView.vue
│   │   │   ├── OverdueTaskView.vue
│   │   │   ├── PersonnelHealthView.vue
│   │   │   ├── ProjectExpenditureView.vue
│   │   │   ├── ProjectOverviewView.vue
│   │   │   └── TaskCompletionView.vue
│   │   ├── CompanyDashboard.vue
│   │   ├── RegionalDashboard.vue
│   │   ├── KpiGrid.vue
│   │   ├── KpiPanel.vue
│   │   ├── WatchList.vue
│   │   ├── RegularList.vue
│   │   ├── SparkLine.vue
│   │   └── EmptyState.vue
│   ├── assets/
│   │   └── dashboard.css  # 全局样式变量
│   ├── App.vue
│   └── main.js
├── package.json
├── vite.config.js
└── vitest.config.js
```

## ✨ 主要功能

### KPI 监控
- **任务完成率**: 计划完成率 vs 实际完成率对比
- **逾期任务率**: 逾期任务趋势监控
- **人员健康度**: 基于项目挂名数量的风险评估
- **开工/完工准点率**: 任务按时开始和完成的比例
- **平均工期比**: 实际工期与计划工期的比值
- **进度兑现指数**: 综合多维度指标的项目健康评分

### 视图层级
- **项目级**: 单个项目的详细 KPI 和任务数据
- **区域级**: 按区域聚合的项目概览
- **公司级**: 全局项目健康度统计

### 架构特性
- **配置驱动**: 区域、KPI、阈值等通过配置管理
- **适配器模式**: 数据服务层支持多数据源切换
- **空状态处理**: 数据缺失时显示友好的空状态组件
- **类型安全**: 完整的数据类型定义和验证函数

## 🚀 快速开始

### 环境准备
- Node.js v16+
- npm

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 运行测试
```bash
npm test
```

### 构建生产版本
```bash
npm run build
```

## 📊 数据源

当前使用本地 CSV 文件作为数据源（`test_data/` 目录）：

| 文件 | 用途 |
|------|------|
| `template_test.csv` | 任务数据（工作项、计划/实际时间、状态等） |
| `template_test_people.csv` | 人员数据（干系人、项目、区域映射） |
| `template_test_fund.csv` | 资金数据（预留，暂未启用） |

### 数据适配器

系统采用适配器模式，支持数据源切换：

```javascript
import { setDataAdapter } from './services/dataService'
import { csvAdapter } from './services/adapters/csvAdapter'

// 设置 CSV 适配器
setDataAdapter(csvAdapter)

// 后续可切换为 API 适配器
// setDataAdapter(apiAdapter)
```

### 接口实现状态

| 接口 | 状态 | 说明 |
|------|------|------|
| `getProjects()` | ✅ 完整 | 项目列表，含扩展指标 |
| `getKpis(projectId)` | ✅ 完整 | KPI卡片数据 |
| `getTaskData(projectId, kpi)` | ✅ 完整 | 任务完成率/逾期率图表 |
| `getPersonnelData(projectId)` | ✅ 完整 | 人员列表及项目挂名统计 |
| `getProjectSeries(projectId)` | ✅ 完整 | 进度兑现指数时间序列 |
| `getRiskProjects(region)` | ✅ 完整 | 风险项目列表 |
| `getCompanyInsights()` | ⚠️ 部分 | 公司级统计，trend为空 |
| `getRegionalData(region)` | ⚠️ 部分 | 区域数据，resourceLoad为空 |
| `getFundData(projectId)` | ⏳ 预留 | 资金数据，待接入 |
| `getExpenditureData(projectId)` | ⏳ 预留 | 支出数据，待接入 |
| `getProjectUpdates()` | ⏳ 预留 | 项目动态/日报，待接入 |
| `getWorkOrders()` | ⏳ 预留 | 工单列表，待接入 |
| `getAttributionData(kpi)` | ⏳ 预留 | AI归因分析，待接入 |

### KPI 数据支持

| KPI | 状态 | 说明 |
|-----|------|------|
| 任务完成率 | ✅ | 基于计划/实际完成时间 |
| 逾期任务率 | ✅ | 基于计划完成时间和状态 |
| 人员健康度 | ✅ | 基于人员项目挂名数 |
| 资金到账率 | ⏳ | 待资金数据接入 |
| 项目支出金额 | ⏳ | 待支出数据接入 |
| 关键里程碑达成率 | ⏳ | 待里程碑数据接入 |

### 扩展指标支持

| 指标 | 状态 | 说明 |
|------|------|------|
| 开工准点率 | ✅ | 基于计划/实际开始时间 |
| 完工准点率 | ✅ | 基于计划/实际完成时间 |
| 平均工期比 | ✅ | 基于计划/实际工期 |
| 逾期趋势比 | ✅ | 当前逾期率/上周逾期率 |
| 进度兑现指数 | ⚠️ | 关键里程碑(35%权重)暂为0 |

## 🧪 测试

项目包含单元测试和属性测试：

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 📝 开发规范

- **样式**: 使用 CSS 变量（定义在 `src/assets/dashboard.css`）
- **组件**: Composition API + `<script setup>` 风格
- **配置**: 集中管理在 `src/config/index.js`
- **数据服务**: 通过适配器模式解耦数据源

详细规范参考 `conductor/` 目录下的文档。


## 🔧 当前待改进项

1. **指标展示一致性**
   - 左侧项目列表抽屉展开后的指标与右侧进度兑现指数的计算逻辑存在差异，需统一口径

2. **指标计算逻辑校验**
   - 部分指标的计算逻辑尚未与《指标体系册》严格对齐，需逐项核对
   - 数据刷新周期（日/周/月）及各指标的更新频次待确认
   - 需结合更多实际数据观察效果，持续调优指标呈现方式

3. **数据源扩展**
   - 当前仅接入任务和人员数据，资金数据接口已预留但未启用
   - 需获取项目日报、周报等更丰富的数据源，完善看板内容

## 🚀 未来方向

- **AI 辅助分析**：基于更完整的项目数据，引入 AI 能力进行风险预警、趋势预测和智能归因分析
- **数据源对接**：完成与后端 API 的对接，实现数据实时更新
- **指标体系完善**：补充关键里程碑、资金到账率等核心指标的完整计算逻辑
- **可视化增强**：优化图表交互体验，支持更多维度的数据下钻分析
