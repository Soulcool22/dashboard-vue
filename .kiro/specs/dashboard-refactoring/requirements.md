# Requirements Document

## Introduction

本文档定义了项目管理系统数据看板的重构需求，目标是消除硬编码、统一数据接口、减少代码冗余，使系统成为一个可灵活接入任意数据源的通用框架。

## Glossary

- **Dashboard_System**: 项目管理系统数据看板，用于展示项目状态、KPI指标和风险分析
- **Data_Service**: 数据服务层，负责从数据源获取数据并转换为组件所需格式
- **Config_Manager**: 配置管理器，负责管理所有可配置项
- **KPI_Component**: KPI指标展示组件，包括卡片和详情视图
- **Project_List_Component**: 项目列表组件，包括关注列表和常规列表
- **Utility_Module**: 工具模块，包含公共函数和格式化方法

## Requirements

### Requirement 1: 配置化管理

**User Story:** As a 开发者, I want 所有可配置项集中管理, so that 接入新数据时无需修改组件代码。

#### Acceptance Criteria

1. THE Config_Manager SHALL 提供区域列表配置接口
2. THE Config_Manager SHALL 提供KPI类型配置接口，包含标题、比较模式、是否显示变化量等属性
3. THE Config_Manager SHALL 提供风险阈值配置接口
4. THE Config_Manager SHALL 提供人员健康度阈值配置接口
5. WHEN 配置项变更时 THEN THE Dashboard_System SHALL 自动响应配置变化
6. THE Config_Manager SHALL 支持从外部配置文件加载配置

### Requirement 2: 数据服务层标准化

**User Story:** As a 开发者, I want 数据服务层有清晰的接口定义, so that 接入真实数据时只需实现接口而无需修改组件。

#### Acceptance Criteria

1. THE Data_Service SHALL 定义统一的项目数据接口
2. THE Data_Service SHALL 定义统一的KPI数据接口
3. THE Data_Service SHALL 定义统一的资金数据接口
4. THE Data_Service SHALL 定义统一的支出数据接口
5. THE Data_Service SHALL 定义统一的人员数据接口
6. THE Data_Service SHALL 定义统一的任务数据接口
7. WHEN 数据源为空或不可用时 THEN THE Data_Service SHALL 返回符合接口定义的空数据结构
8. THE Data_Service SHALL 支持数据源配置切换

### Requirement 3: 消除组件硬编码

**User Story:** As a 开发者, I want 组件不包含业务相关的硬编码值, so that 组件可以适应不同的业务场景。

#### Acceptance Criteria

1. WHEN KpiGrid组件渲染时 THEN THE KPI_Component SHALL 从配置获取比较模式和显示规则
2. WHEN KpiPanel组件选择视图时 THEN THE KPI_Component SHALL 从配置获取视图映射关系
3. WHEN 计算人员健康度时 THEN THE Dashboard_System SHALL 从配置获取风险阈值
4. WHEN 显示区域导航时 THEN THE Dashboard_System SHALL 从配置获取区域列表
5. THE Dashboard_System SHALL 不包含任何业务特定的字符串常量

### Requirement 4: 代码复用优化

**User Story:** As a 开发者, I want 公共代码提取到工具模块, so that 减少代码冗余并便于维护。

#### Acceptance Criteria

1. THE Utility_Module SHALL 提供统一的数值格式化函数
2. THE Utility_Module SHALL 提供统一的日期格式化函数
3. THE Utility_Module SHALL 提供统一的百分比计算函数
4. THE Utility_Module SHALL 提供统一的变化量计算函数
5. WHEN WatchList和RegularList需要计算指标时 THEN THE Project_List_Component SHALL 使用Utility_Module中的函数
6. WHEN 图表组件需要生成日期标签时 THEN THE KPI_Component SHALL 使用Utility_Module中的函数

### Requirement 5: 图表组件复用

**User Story:** As a 开发者, I want 相似的图表组件共享基础逻辑, so that 减少重复代码并统一行为。

#### Acceptance Criteria

1. THE KPI_Component SHALL 提供可复用的折线图基础组件
2. WHEN TaskCompletionView和OverdueTaskView渲染图表时 THEN THE KPI_Component SHALL 复用基础图表逻辑
3. THE KPI_Component SHALL 支持通过配置定制图表样式和行为
4. THE KPI_Component SHALL 统一处理ResizeObserver逻辑

### Requirement 6: 数据接口文档化

**User Story:** As a 开发者, I want 数据接口有清晰的文档和类型定义, so that 接入数据时有明确的参考。

#### Acceptance Criteria

1. THE Data_Service SHALL 为每个接口提供TypeScript类型定义或JSDoc注释
2. THE Data_Service SHALL 为每个接口提供示例数据结构
3. THE Data_Service SHALL 为每个接口提供字段说明
4. WHEN 接口返回数据时 THEN THE Data_Service SHALL 验证数据结构符合定义

### Requirement 7: 错误处理和空状态

**User Story:** As a 用户, I want 系统在数据缺失时显示友好的空状态, so that 我知道系统正常运行但暂无数据。

#### Acceptance Criteria

1. WHEN 项目列表为空时 THEN THE Project_List_Component SHALL 显示"暂无数据"提示
2. WHEN KPI数据为空时 THEN THE KPI_Component SHALL 显示默认值而非错误
3. WHEN 图表数据为空时 THEN THE KPI_Component SHALL 显示空图表状态
4. IF 数据加载失败 THEN THE Dashboard_System SHALL 显示错误提示并提供重试选项
