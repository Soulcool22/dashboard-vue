# 技术栈

## 核心框架与库
- **Vue 3**: 渐进式 JavaScript 框架，使用 Composition API (`<script setup>` 语法)。
- **Element Plus**: 基于 Vue 3 的组件库，用于快速构建专业界面。
- **Apache ECharts**: 强大的可视化图表库，用于展示 KPI 趋势和对比。
- **IconPark**: 统一的图标库，提供风格一致的视觉元素。

## 开发与构建
- **Vite**: 极速的构建工具（当前使用 rolldown-vite 变体）。
- **npm**: 项目依赖包管理。

## 样式与设计
- **原生 CSS**: 使用 CSS 变量管理主题颜色和通用样式（`src/assets/dashboard.css`）。
- **响应式布局**: 针对 PC 端和大屏优化。

## 数据架构
- **数据处理层**: `src/services/dataService.js` 负责本地 CSV 数据的解析、清洗与指标计算。
- **扩展性**: 结构上预留了 API 调用路径，方便后续接入 `axios` 或 `fetch`。
