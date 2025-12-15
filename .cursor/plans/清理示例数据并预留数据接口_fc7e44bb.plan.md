---
name: 清理示例数据并预留数据接口
overview: 清理看板中所有硬编码的示例数据（名称、数值、文本），保留所有模块和布局，创建统一的数据服务接口层用于未来接入CSV数据，所有组件改为从数据服务获取数据。
todos:
  - id: create-data-service
    content: 创建统一数据服务层 src/services/dataService.js，定义所有数据接口方法，暂时返回空数据
    status: pending
  - id: clean-app-vue
    content: 清理 App.vue 中的示例数据，改为从数据服务获取
    status: pending
    dependencies:
      - create-data-service
  - id: clean-company-dashboard
    content: 清理 CompanyDashboard.vue 中的示例数据，改为从数据服务获取
    status: pending
    dependencies:
      - create-data-service
  - id: clean-regional-dashboard
    content: 清理 RegionalDashboard.vue 中的示例数据，改为从数据服务获取
    status: pending
    dependencies:
      - create-data-service
  - id: clean-project-updates
    content: 清理 ProjectUpdates.vue 中的示例数据，改为从数据服务获取
    status: pending
    dependencies:
      - create-data-service
  - id: clean-attribution
    content: 清理 AttributionAnalysis.vue 中的示例数据，改为从数据服务获取
    status: pending
    dependencies:
      - create-data-service
  - id: clean-kpi-views
    content: 清理所有KPI视图组件（FundArrivalView、ProjectExpenditureView、PersonnelHealthView、TaskCompletionView、OverdueTaskView、ProjectOverviewView）中的示例数据，改为从数据服务获取
    status: pending
    dependencies:
      - create-data-service
---

# 清理示例数据并预留统一数据接口

## 目标

1. 清理所有硬编码的示例数据（名称、数值、文本），保留模块和布局
2. 创建统一的数据服务接口层，预留CSV数据接入位置
3. 所有组件改为从数据服务获取数据，空数据时显示占位符和0

## 实施步骤

### 1. 创建数据服务层

创建 `src/services/dataService.js`：

- 定义统一的数据接口规范（项目列表、KPI指标、风险项目、人员数据等）
- 预留CSV数据加载函数（暂时返回空数据）
- 提供数据获取方法供组件调用
- 数据路径配置指向 `@test_data`（暂时不实现加载逻辑）

### 2. 清理 App.vue 中的示例数据

- 清空 `regulars` 数组（保留结构，数据为空数组）
- 清空 `projects` 数组
- 清空 `kpis` 数组（保留KPI类型定义，数值为0或空）
- 移除 `generateSeriesData()` 中的随机数据生成，返回空数组
- 清空头部信息中的示例文本（统计周期、更新时间等）
- 改为从数据服务获取数据

### 3. 清理 CompanyDashboard.vue

- 清空 `riskProjects` 数组
- 清空管理视点文本内容
- 清空所有指标数值（健康指数、人员健康度等）
- 清空趋势图表数据
- 改为从数据服务获取数据

### 4. 清理 RegionalDashboard.vue

- 清空 `projects` 和 `riskProjects` 数组
- 清空区域态势文本内容
- 清空图表数据
- 改为从数据服务获取数据

### 5. 清理 ProjectUpdates.vue

- 清空 `updates` 和 `workOrders` 数组
- 改为从数据服务获取数据

### 6. 清理 AttributionAnalysis.vue

- 清空 `attributionData` 对象中的所有归因分析数据
- 保留结构，返回空数据或默认占位文本
- 改为从数据服务获取数据

### 7. 清理所有KPI视图组件

- **FundArrivalView.vue**: 清空 `fundStages`、`overdueItems`，金额为0
- **ProjectExpenditureView.vue**: 清空 `topExpenditures`、`expenditurePeriods`，预算和支出为0
- **PersonnelHealthView.vue**: 清空 `allMembers` 数组
- **TaskCompletionView.vue**: 移除模拟数据生成，返回空数据
- **OverdueTaskView.vue**: 移除模拟数据生成，返回空数据
- **ProjectOverviewView.vue**: 清空默认数据
- 所有组件改为从数据服务获取数据

### 8. 处理空数据状态

- 所有数值显示为 0
- 所有文本显示为空或占位符（如"暂无数据"）
- 列表为空时显示空状态
- 图表数据为空时显示空图表

## 文件清单

### 新建文件

- `src/services/dataService.js` - 统一数据服务接口

### 修改文件

- `src/App.vue`
- `src/components/CompanyDashboard.vue`
- `src/components/RegionalDashboard.vue`
- `src/components/ProjectUpdates.vue`
- `src/components/AttributionAnalysis.vue`
- `src/components/kpi/FundArrivalView.vue`
- `src/components/kpi/ProjectExpenditureView.vue`
- `src/components/kpi/PersonnelHealthView.vue`
- `src/components/kpi/TaskCompletionView.vue`
- `src/components/kpi/OverdueTaskView.vue`
- `src/components/kpi/ProjectOverviewView.vue`

## 数据接口规范

数据服务将提供以下接口方法：

- `getProjects()` - 获取项目列表
- `getKpis(projectId?)` - 获取KPI指标
- `getRiskProjects(region?)` - 获取风险项目
- `getProjectSeries(projectId)` - 获取项目进度系列数据
- `getCompanyInsights()` - 获取公司级洞察数据
- `getRegionalData(region)` - 获取区域数据
- `getProjectUpdates()` - 获取项目更新
- `getWorkOrders()` - 获取工单数据
- `getAttributionData(kpi)` - 获取归因分析数据
- `getFundData(projectId)` - 获取资金数据
- `getExpenditureData(projectId)` - 获取支出数据
- `getPersonnelData(projectId)` - 获取人员数据
- `getTaskData(projectId, kpi)` - 获取任务数据（完成率、逾期率等）

所有方法暂时返回空数据或默认值，未来接入CSV时在此处实现加载逻辑。