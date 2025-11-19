# 项目开发规则（dashboard-vue 定制版）

## 你的所有回答和与我交互生成的文件使用中文

## 概述

- 当前项目为单页数据看板：Vue 3 + Element Plus + ECharts + IconPark
- 使用 JavaScript（非 TypeScript），未接入路由/Pinia/axios
- 构建工具为 Vite（rolldown-vite@7.2.2），包管理使用 npm

## 快速启动

- 安装依赖：`npm install`
- 启动开发：`npm run dev`（默认 5173，端口占用时自动顺延）
- 生产构建：`npm run build`
- 本地预览：`npm run preview`

## 实际依赖

- `vue@^3.5.24`
- `element-plus@^2.11.7`
- `echarts@^6.0.0`
- `@icon-park/vue-next@^1.4.2`
- 开发：`@vitejs/plugin-vue@^6.0.1`、`rolldown-vite@7.2.2`

## 目录结构（当前）

```
src/
├── assets/
│   └── dashboard.css
├── components/
│   ├── WatchList.vue
│   ├── RegularList.vue
│   ├── KpiGrid.vue
│   ├── CompletionLine.vue
│   └── ResearchChat.vue
├── App.vue
└── main.js
```

## 代码规范

- 统一使用 `<script setup>`
- 统一使用 Element Plus 组件
- 样式集中在 `src/assets/dashboard.css`，通过 CSS 变量控制主题（`--bg`、`--card`、`--text`、`--muted`、`--border`、`--accent`）
- 组件命名：PascalCase 文件名（如 `WatchList.vue`），函数以 `handle` 前缀命名事件处理
- 不提交密钥与敏感信息到仓库

## UI 规范（关键控件）

- 搜索框（右侧 AI 区域）：
  - 圆角输入：`.search-container .el-input__wrapper { border-radius: 22px; border: 2px solid var(--accent) }`
  - 右侧圆形按钮：`.search-button { width: 28px; height: 28px; border-radius: 50% }`
  - 输入右内边距：`.el-input__inner { padding-right: 40px }`
- KPI 卡片：使用 Element Plus `el-card`，压缩卡片内部 padding：`.kpi .el-card__body { padding: 6px 10px }`
- 全局隐藏滚动条但保留滚动：
  - WebKit：`::-webkit-scrollbar { width: 0; height: 0 }`
  - Firefox：`* { scrollbar-width: none }`

## 图表规范（ECharts）

- 折线颜色：
  - 实际线绿色：`#15803d`，区域渐变上色：`rgba(21,128,61,0.45)` → `rgba(187,247,208,0.05)`
  - 计划线灰色：`#64748b`
- SparkLine 缩略图：`symbolSize: 3`、`lineStyle.width: 2`、`smooth: true`
- 统一坐标轴隐藏（列表缩略图）与网格边距收紧（`grid`）

## 数据与状态

- 目前使用本地 mock 数据与生成方法（如 `generateSeriesData()`）
- 需要接入真实 API 时：
  - 新增 `axios`（或 `fetch` 封装）到 `dependencies`
  - 在 `src/api/` 创建模块，统一返回 `{ code, data, message }` 格式
  - 异步调用需带错误提示与 loading 状态（`ElMessage`、`v-loading`）

## 构建与预览

- 开发：`npm run dev`，如 5173 占用则自动改为 5174 等
- 构建：`npm run build` 生成 `dist/`
- 预览：`npm run preview` 启动本地静态预览

## 命名规范

- 文件：PascalCase（如 `CompletionLine.vue`）
- 变量：camelCase（如 `isSearchActive`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- 函数：以 `handle` 前缀（如 `handleSelectProject`）

## 必备配置（当前）

- `src/main.js`：

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { install } from '@icon-park/vue-next/es/all'
import '@icon-park/vue-next/styles/index.css'
import './assets/dashboard.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
// 图标全局注册：推荐直接调用 install(app)
install(app)
app.mount('#app')
```

## Icon 使用规范（IconPark）

- 官方站点：`https://iconpark.oceanengine.com/official`
- 按需导入（首选）：`import { Home } from '@icon-park/vue-next'` → `<home theme="outline" size="16" />`
- 全局注册（当前项目已启用）：`install(app)` 默认前缀 `icon` → `<icon-search />`
- 模板命名小写中划线；脚本导入使用帕斯卡命名（`dislike-two` → `DislikeTwo`）
- 与 Element Plus 搭配时 `size` 跟随字号，`fill` 默认 `currentColor`

## 安全与密钥

- 不在仓库中存储任何密钥或账号信息
- 如需使用 Gemini CLI：设置环境变量 `GEMINI_API_KEY`（Windows PowerShell）
  - 临时：`$env:GEMINI_API_KEY = 'YOUR_KEY'`
  - 用户级持久化：`setx GEMINI_API_KEY "YOUR_KEY"`
  - 机器级（管理员）：`setx GEMINI_API_KEY "YOUR_KEY" /M`
- 若后续改用 Google 登录或 Vertex AI，需要清理或覆盖该变量，并设置 `GOOGLE_CLOUD_PROJECT` 与 `GOOGLE_CLOUD_LOCATION`

## 开发流程（当前项目）

1. 页面开发：在 `src/components/` 或 `src/App.vue` 扩展
2. 样式扩展：统一改动 `src/assets/dashboard.css`
3. 图表调整：`SparkLine.vue`、`CompletionLine.vue` 按本规范颜色与样式
4. 交互增强：使用 Element Plus 的反馈控件（`ElMessage`、`ElMessageBox`）
5. 验证：通过 `npm run dev` 预览并检查样式与交互

### API 调用

⚠️ **重要约束：优先基于真实的 API 文档进行开发，无文档时使用 mock 数据**

**开发原则：**

- 有文档 = 严格按文档开发
- 无文档 = 使用 mock 数据开发功能
- mock 数据必须合理、完整，便于后续替换
- 添加明确的 TODO 注释标记需要替换

```javascript

// src/api/user.js

import request from'@/utils/request';


// 方式1：基于真实 API 文档

// 文档：GET /api/user/list?pageNum=1&pageSize=10&keyword=xxx

// 返回：{ code: 200, data: { rows: [], total: 100 }, message: 'success' }

exportfunction getUserList(params) {

  return request({

    url: '/user/list',

    method: 'get',

    params

  });

}


// 方式2：无文档时使用 mock 数据

// TODO: 替换为真实API - 需要后端提供接口文档

exportfunction getUserListMock(params) {

  returnnew Promise(resolve => {

    setTimeout(() => {

      const { pageNum = 1, pageSize = 10, keyword = '' } = params;

      const mockData = [

        { id: 1, name: '张三', email: 'zhang@example.com', status: '正常' },

        { id: 2, name: '李四', email: 'li@example.com', status: '禁用' },

        { id: 3, name: '王五', email: 'wang@example.com', status: '正常' }

      ];


      // 模拟搜索和分页

      let filteredData = mockData;

      if (keyword) {

        filteredData = mockData.filter(item => item.name.includes(keyword));

      }


      const start = (pageNum - 1) * pageSize;

      const end = start + pageSize;

      const rows = filteredData.slice(start, end);


      resolve({

        code: 200,

        data: { rows, total: filteredData.length },

        message: 'success'

      });

    }, 300);

  });

}

```

**API 文档要求格式：**

```

接口名称：获取用户列表

请求地址：GET /api/user/list

请求参数：

- pageNum: number (页码)

- pageSize: number (每页数量)

- keyword: string (搜索关键字，可选)


返回格式：

{

  code: 200,

  data: {

    rows: [

      { id: 1, name: "张三", email: "zhang@example.com" }

    ],

    total: 100

  },

  message: "success"

}


错误码：

- 400: 参数错误

- 401: 未授权

- 500: 服务器错误

```

### Pinia Store

```javascript

// src/store/modules/user.js

import { defineStore } from'pinia';

import { ref, computed } from'vue';


exportconst useUserStore = defineStore(

  'user',

  () => {

    const userInfo = ref({});

    const token = ref('');


    const isLoggedIn = computed(() => !!token.value);


    function setToken(newToken) {

      token.value = newToken;

    }


    function logout() {

      token.value = '';

      userInfo.value = {};

    }


    return { userInfo, token, isLoggedIn, setToken, logout };

  },

  {

    persist: { paths: ['token', 'userInfo'] }

  }

);

```

### 表格页面模板

```vue

<template>

  <div class="app-container">

    <!-- 搜索 -->

    <el-form :model="queryParams" :inline="true">

      <el-form-item label="关键字">

        <el-input v-model="queryParams.keyword" placeholder="请输入" clearable />

      </el-form-item>

      <el-form-item>

        <el-button type="primary" @click="handleQuery">搜索</el-button>

        <el-button @click="resetQuery">重置</el-button>

      </el-form-item>

    </el-form>


    <!-- 操作 -->

    <el-button type="primary" @click="handleAdd">新增</el-button>


    <!-- 表格 -->

    <el-table v-loading="loading" :data="dataList">

      <el-table-column label="ID" prop="id" />

      <el-table-column label="名称" prop="name" />

      <el-table-column label="操作" width="180">

        <template #default="scope">

          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>

          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>

        </template>

      </el-table-column>

    </el-table>


    <!-- 分页 -->

    <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" @current-change="getList" />

  </div>

</template>


<script setup>

import { ref, onMounted } from 'vue';

import { ElMessage, ElMessageBox } from 'element-plus';


const loading = ref(false);

const dataList = ref([]);

const total = ref(0);


const queryParams = ref({

  pageNum: 1,

  pageSize: 10,

  keyword: ''

});


async function getList() {

  loading.value = true;

  try {

    // const response = await getDataList(queryParams.value);

    // dataList.value = response.rows;

    // total.value = response.total;

  } finally {

    loading.value = false;

  }

}


function handleQuery() {

  queryParams.value.pageNum = 1;

  getList();

}


function resetQuery() {

  queryParams.value.keyword = '';

  handleQuery();

}


function handleAdd() {

  // 新增逻辑

}


function handleEdit(row) {

  // 编辑逻辑

}


async function handleDelete(row) {

  await ElMessageBox.confirm('确认删除？');

  // 删除逻辑

  ElMessage.success('删除成功');

  getList();

}


onMounted(() => {

  getList();

});

</script>

```

## ⚡ 命名规范

-**文件**: PascalCase (`UserList.vue`)

-**变量**: camelCase (`userList`, `isLoading`)

-**常量**: UPPER_SNAKE_CASE (`API_BASE_URL`)

-**函数**: handle 开头 (`handleSubmit`, `handleDelete`)

## 🎯 必备配置

### vite.config.js

```javascript

import { defineConfig } from'vite';

import vue from'@vitejs/plugin-vue';

import { resolve } from'path';


exportdefault defineConfig({

  plugins: [vue()],

  resolve: {

    alias: { '@': resolve(__dirname, 'src') }

  },

  server: {

    port: 3000,

    proxy: {

      '/api': {

        target: 'http://localhost:8080',

        changeOrigin: true

      }

    }

  }

});

```

### main.js

```javascript

import { createApp } from'vue';

import { createPinia } from'pinia';

import ElementPlus from'element-plus';

import'element-plus/dist/index.css';

import router from'./router';

import App from'./App.vue';


const app = createApp(App);

app.use(createPinia());

app.use(router);

app.use(ElementPlus);

app.mount('#app');

```

### utils/request.js

```javascript

import axios from'axios';

import { ElMessage } from'element-plus';


const service = axios.create({

  baseURL: '/api',

  timeout: 5000

});


service.interceptors.response.use(

  response => response.data,

  error => {

    ElMessage.error(error.message);

    return Promise.reject(error);

  }

);


exportdefault service;

```

## 📝 开发流程

1.**页面开发**: `src/views/` 下创建页面

2.**路由配置**: `src/router/` 下添加路由

3.**API 接口**: `src/api/` 下定义接口

4.**状态管理**: `src/store/modules/` 下创建 store

## ✅ 检查清单

- [ ] 使用 `<script setup>` 语法
- [ ] 使用 Element Plus 组件
- [ ] API 调用包含错误处理
- [ ] 异步操作显示 loading
- [ ] 操作有成功/失败提示
- [ ] 样式使用 scoped

---

#### 1. 开发新页面

```

请严格按照上述Vue3+Element Plus开发规范，帮我创建一个用户管理页面。


需求：

- 页面路径：src/views/system/user/index.vue

- 功能：用户列表查询、新增用户、编辑用户、删除用户

- 包含：搜索表单、数据表格、新增编辑弹窗


请生成完整的页面代码，包括：

1. Vue组件代码（template + script setup + style）

2. 对应的API接口文件

3. 路由配置代码

```

#### 2. 开发 API 接口

```

按照上述规范，帮我创建 [业务模块] 的 API 接口文件。


如果有真实的 API 文档，请提供：

1. 接口地址和请求方法

2. 请求参数格式和说明

3. 返回数据格式

4. 错误码定义


如果没有 API 文档，请使用 mock 数据开发，要求：

1. 创建合理的数据结构

2. 模拟真实业务场景

3. 添加 TODO 注释标记后续替换

4. 便于后续接入真实 API


请生成 src/api/[模块名].js 文件的完整代码。

```

#### 3. 开发公共组件

```

按照上述规范，帮我创建一个文件上传组件。


组件功能：支持单文件上传，显示上传进度，支持文件类型限制

Props参数：accept(文件类型)、maxSize(文件大小限制)

事件：on-success(上传成功)、on-error(上传失败)


请生成src/components/FileUpload/index.vue的完整代码。

```

#### 4. 修改现有代码

```

基于上述开发规范，帮我优化以下代码：


[贴入现有代码]


优化需求：

- 添加loading状态

- 优化错误处理

- 调整样式布局


请保持代码风格一致，确保符合规范要求。

```

### 使用技巧

- 每次对话开始时先发送规范内容作为上下文
- 描述需求时尽量详细和具体
- 可以要求生成多个相关文件（组件、API、路由等）
- 遇到问题时可以贴出现有代码请求优化
- 你的所有回答使用中文

**遵循规范，高效开发！**

## 🔖 Icon 使用规范（IconPark）

### 选择与来源

- 图标库：IconPark（字节跳动官方）
- 官方站点：`https://iconpark.oceanengine.com/official`
- 优先使用 IconPark，保证风格统一、主题一致、可扩展性强。

### 安装与引入（Vue3）

```bash
# 安装 IconPark for Vue3
npm install @icon-park/vue-next --save

# 推荐：全局引入样式一次
# 在 src/main.js 中添加：
import '@icon-park/vue-next/styles/index.css'
```

### 使用方式

- 按需组件导入（推荐，体积更小）

```vue
<template>
  <home theme="outline" size="18" />
</template>

<script setup>
import { Home } from '@icon-park/vue-next'
</script>
```

- 全局注册（用于远程菜单等需要动态名称的场景）

```javascript
// src/main.js
import { createApp } from 'vue'
import { install } from '@icon-park/vue-next/es/all'
import App from './App.vue'
import '@icon-park/vue-next/styles/index.css'

const app = createApp(App)
install(app)       // 默认前缀 'icon'，例如 People => <icon-people />
// install(app, 'i') // 自定义前缀 'i'，例如 People => <i-people />
app.mount('#app')
```

- 动态组件（通过类型名渲染）

```vue
<template>
  <icon-park type="add-text" theme="filled" />
</template>

<script setup>
import { IconPark } from '@icon-park/vue-next/es/all'
</script>
```

### 主题与属性规范

- `theme`：统一默认使用 `outline`；对于强调/填充场景可使用 `filled`；双色/多色谨慎使用，确保与主题一致。
- `size`：使用数字或字符串，常用 `16`、`18`、`20`。在文本内跟随字体大小时使用 `1em`。
- `fill`：默认 `currentColor`，跟随父元素颜色；在需要特殊强调时设置具体色值。
- `strokeWidth`：默认 `4`，保持线条一致性；若需要细线条可适度下调。
- 其他属性：`spin`（旋转）、`strokeLinecap`、`strokeLinejoin` 按需设置。

### 命名与导入约定

- 在模板中使用小写加中划线：`<icon-folder-open />`
- 在脚本中导入使用帕斯卡命名：`FolderOpen`
- 对于带中划线的图标名（如 `dislike-two`），导入名为 `DislikeTwo`。
- 为避免与自定义组件冲突，建议给导入添加统一别名前缀（可选）：

```javascript
import { FolderOpen as IconFolderOpen } from '@icon-park/vue-next'
```

### 与 Element Plus 的协作

- 在按钮、输入框等组件内使用 IconPark，保持 `size` 与组件字号一致，`fill` 继承文字颜色：

```vue
<el-button type="primary">
  <search theme="outline" size="16" style="margin-right:6px" />
  搜索
</el-button>
```

### 性能与体积

- 优先“按需导入”，避免全量注册导致包体过大。
- 仅在需要“动态类型渲染”或大量图标时使用全局注册/动态组件。

### 示例清单（常用图标）

- `search`（搜索）、`home`（首页）、`setting`（设置）、`config`（配置）·
- `bookmark`（书签）、`camera`（相机）、`equalizer`（均衡器）、`radar`（雷达）
- `zoom-in` / `zoom-out`（缩放）、`refresh`（刷新）、`save`（保存）

### 目录与提交约束

- 不将图标 SVG 手动复制到仓库，统一从 `@icon-park/vue-next` 引入。
- 若需要自定义图标，统一放置在 `src/assets/icons` 并注明来源与许可。
