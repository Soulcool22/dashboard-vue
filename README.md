# Dashboard-Vue

这是一个基于 Vue 3 + Element Plus 的单页数据看板项目，用于可视化展示工程项目的关键绩效指标（KPI），包括资金到位、任务完成情况、人员健康、项目支出等维度。

## 🛠 技术栈

- **核心框架**: [Vue 3](https://vuejs.org/) (使用 `<script setup>` 语法)
- **构建工具**: [Vite](https://vitejs.dev/) (rolldown-vite)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **图表库**: [Apache ECharts](https://echarts.apache.org/)
- **图标库**: [IconPark](https://iconpark.oceanengine.com/)
- **包管理**: npm

## 📂 项目结构

```
dashboard-vue/
├── project_plan_analysis/ # 项目计划与数据分析脚本 (Python)
├── public/                # 静态资源
├── src/
│   ├── api/               # API 接口定义 (如接入后端)
│   ├── assets/            # 静态资源 (CSS, 图片)
│   │   └── dashboard.css  # 全局样式变量与定义
│   ├── components/        # Vue 组件
│   │   ├── kpi/           # 各类 KPI 指标卡片组件
│   │   │   ├── FundArrivalView.vue       # 资金到账
│   │   │   ├── OverdueTaskView.vue       # 逾期任务
│   │   │   ├── TaskCompletionView.vue    # 任务完成率
│   │   │   └── ...
│   │   ├── CompanyDashboard.vue   # 公司级看板
│   │   ├── RegionalDashboard.vue  # 区域级看板
│   │   ├── ResearchChat.vue       # AI 助手对话界面
│   │   └── ...
│   ├── services/          # 业务逻辑服务
│   │   └── dataService.js # CSV 数据解析与指标计算核心逻辑
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── test_data/             # 本地测试数据源 (CSV/Excel)
├── GEMINI.md              # 项目开发规范与文档
├── package.json           # 项目依赖配置
└── vite.config.js         # Vite 配置
```

## ✨ 主要功能

1. **多维度 KPI 监控**:
   - **任务完成率**: 实时追踪项目任务进度。
   - **资金管理**: 监控资金到位与项目支出情况。
   - **风险预警**: 自动识别并展示逾期任务。
   - **人员健康**: 关注项目人员状态。
2. **层级化看板**:
   - 支持 **区域级 (Regional)** 与 **公司级 (Company)** 视图切换。
3. **数据驱动**:
   - 前端直接解析 CSV/Excel 数据源（位于 `test_data/`），支持快速原型验证与离线演示。
   - 内置数据清洗与计算逻辑 (`dataService.js`)。
4. **交互式图表**:
   - 集成 ECharts 折线图、柱状图。
   - 自定义 SparkLine 迷你图用于列表展示。

## 🚀 快速开始

### 1. 环境准备

确保您的环境已安装 Node.js (推荐 v16+)。

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动后访问终端输出的本地地址（通常为 `http://localhost:5173`）。

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 5. 本地预览构建产物

```bash
npm run preview
```

## 📊 数据源说明

目前项目使用本地 CSV 文件作为数据源，位于 `test_data/` 目录。
主要数据文件包括：

- `template_test.csv`: 包含任务名称、开始时间、结束时间、完成状态等核心字段。

若需更新数据，请直接替换该目录下的相应文件，或修改 `src/services/dataService.js` 中的引用路径。

## 📝 开发规范

详细的开发规范、命名约定与 UI 设计指南请参考项目根目录下的 [GEMINI.md](./GEMINI.md) 文件。

- **样式**: 统一使用 CSS 变量（定义在 `src/assets/dashboard.css`）。
- **图标**: 使用 IconPark，按需引入或全局注册。
- **组件**: 采用 Composition API `<script setup>` 风格。
