# JavaScript/Vue 代码规范

## 基础准则
- 使用 ES6+ 语法。
- 优先使用 `const`，仅在变量需要重新赋值时使用 `let`。
- 统一使用箭头函数。

## Vue 3 规范
- **组合式 API**: 必须使用 `<script setup>` 语法。
- **响应式**: 优先使用 `ref` 处理基础类型和数组，`reactive` 处理复杂对象。
- **Props**: 必须使用 `defineProps` 进行显式声明。
- **Emits**: 必须使用 `defineEmits` 声明自定义事件。

## 命名约定
- **组件文件**: PascalCase (例如 `KpiCard.vue`)。
- **变量/函数**: camelCase (例如 `isLoaded`, `handleQuery`)。
- **常量**: UPPER_SNAKE_CASE (例如 `MAX_RETRY_LIMIT`)。

## UI 与组件
- 统一使用 Element Plus 组件库。
- 严禁直接操作 DOM，应通过数据驱动视图。
- 样式应尽可能使用 `scoped`，除非是全局变量覆盖。

## 异步处理
- 统一使用 `async/await` 处理异步逻辑。
- 必须包含错误处理逻辑 (try/catch)。
- 异步操作应有 Loading 状态提示。
