# Implementation Plan: Dashboard Refactoring

## Overview

本实现计划将硬编码的仪表板系统重构为配置驱动的通用框架。按照依赖顺序实现：先建立基础设施（配置、工具、类型），再重构数据服务，最后更新组件。

## Tasks

- [ ] 1. 创建配置管理模块
  - [ ] 1.1 创建 src/config/index.js 配置管理器
    - 定义 dashboardConfig 对象，包含 regions、kpis、thresholds、display 配置
    - 实现 getKpiConfig、getRegions、getThreshold 辅助函数
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 1.2 编写配置管理器属性测试
    - **Property 1: 配置完整性**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 2. 创建工具模块
  - [ ] 2.1 创建 src/utils/formatters.js 格式化函数
    - 实现 formatPercent、formatCurrency、formatDate 函数
    - _Requirements: 4.1, 4.2_
  - [ ] 2.2 创建 src/utils/calculators.js 计算函数
    - 实现 calculateDelta、calculateRate、getSeriesLastValue、getSeriesDelta 函数
    - _Requirements: 4.3, 4.4_
  - [ ] 2.3 创建 src/utils/dateHelpers.js 日期辅助函数
    - 实现 buildDateLabels、dateRangeInclusive 函数
    - _Requirements: 4.2_
  - [ ] 2.4 创建 src/utils/index.js 统一导出
    - 导出所有工具函数
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 2.5 编写工具函数属性测试
    - **Property 5: 数值格式化有效性**
    - **Property 6: 日期格式化有效性**
    - **Property 7: 百分比计算边界安全**
    - **Property 8: 变化量计算正确性**
    - **Property 9: 日期标签生成一致性**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ] 3. 创建数据类型定义
  - [ ] 3.1 创建 src/services/dataTypes.js 类型定义
    - 定义 Project、KpiData、FundData、ExpenditureData、PersonnelData、TaskData 类型
    - 实现 emptyStructures 工厂函数
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ] 3.2 编写数据类型属性测试
    - **Property 3: 数据结构符合接口定义**
    - **Property 4: 空数据源返回有效空结构**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [ ] 4. Checkpoint - 确保基础模块测试通过
  - 运行所有测试，确保基础设施模块正常工作
  - 如有问题请询问用户

- [ ] 5. 重构数据服务层
  - [ ] 5.1 重构 src/services/dataService.js
    - 实现适配器模式，添加 setDataAdapter 函数
    - 重构所有数据获取函数使用适配器
    - 添加错误处理和空数据返回
    - _Requirements: 2.7, 2.8_
  - [ ] 5.2 创建 src/services/errorHandler.js 错误处理
    - 实现 DataLoadError 类
    - 实现 handleDataError 函数
    - _Requirements: 7.4_
  - [ ] 5.3 编写数据服务单元测试
    - 测试适配器切换
    - 测试空数据处理
    - _Requirements: 2.7, 2.8_

- [ ] 6. 重构 App.vue 组件
  - [ ] 6.1 移除硬编码区域列表
    - 从配置获取区域列表
    - 使用 getRegions() 函数
    - _Requirements: 3.4_
  - [ ] 6.2 编写 App.vue 单元测试
    - 测试区域列表从配置加载
    - _Requirements: 3.4_

- [ ] 7. 重构 KPI 组件
  - [x] 7.1 重构 src/components/KpiGrid.vue
    - 移除 kDeltaText 和 showDelta 中的硬编码比较
    - 从配置获取 KPI 显示规则
    - _Requirements: 3.1_
  - [ ] 7.2 重构 src/components/KpiPanel.vue
    - 移除硬编码视图映射
    - 从配置获取 viewComponent 映射
    - _Requirements: 3.2_
  - [ ] 7.3 编写 KPI 组件单元测试
    - 测试配置驱动的显示逻辑
    - _Requirements: 3.1, 3.2_

- [ ] 8. Checkpoint - 确保 KPI 组件测试通过
  - 运行所有测试，确保 KPI 组件正常工作
  - 如有问题请询问用户

- [ ] 9. 重构列表组件
  - [ ] 9.1 重构 src/components/WatchList.vue
    - 移除重复的辅助函数
    - 使用 src/utils 中的函数
    - _Requirements: 4.5_
  - [ ] 9.2 重构 src/components/RegularList.vue
    - 移除重复的辅助函数
    - 使用 src/utils 中的函数
    - _Requirements: 4.5_
  - [ ] 9.3 编写列表组件单元测试
    - 测试工具函数集成
    - _Requirements: 4.5_

- [ ] 10. 重构 KPI 详情视图组件
  - [ ] 10.1 重构 src/components/kpi/PersonnelHealthView.vue
    - 移除硬编码风险阈值
    - 从配置获取 personnelRisk 阈值
    - _Requirements: 3.3_
  - [ ] 10.2 创建 src/components/kpi/BaseChartMixin.js 图表基础逻辑
    - 提取 ResizeObserver 逻辑
    - 提取图表初始化逻辑
    - _Requirements: 5.1, 5.4_
  - [ ] 10.3 重构 src/components/kpi/TaskCompletionView.vue
    - 使用 BaseChartMixin
    - _Requirements: 5.2_
  - [ ] 10.4 重构 src/components/kpi/OverdueTaskView.vue
    - 使用 BaseChartMixin
    - _Requirements: 5.2_
  - [ ] 10.5 编写 KPI 详情视图单元测试

    - 测试阈值配置
    - 测试图表复用逻辑
    - _Requirements: 3.3, 5.2_

- [ ] 11. 添加空状态处理
  - [ ] 11.1 创建 src/components/EmptyState.vue 空状态组件
    - 实现通用空状态显示
    - _Requirements: 7.1, 7.3_
  - [ ] 11.2 更新列表组件使用空状态
    - WatchList 和 RegularList 添加空状态
    - _Requirements: 7.1_
  - [ ] 11.3 更新 KPI 组件使用空状态
    - KPI 详情视图添加空图表状态
    - _Requirements: 7.2, 7.3_
  - [ ] 11.4 编写空状态单元测试

    - 测试空数据显示
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 12. Final Checkpoint - 确保所有测试通过
  - 运行完整测试套件
  - 验证所有组件正常工作
  - 如有问题请询问用户

## Notes

- All tasks are required for comprehensive testing
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
