# Vue3 + Element Plus 企业级前端开发规范

## 📋 项目概述

基于 Vue3 + Element Plus + JavaScript 的企业级前端项目开发模板，适用于各种管理后台和企业应用开发。

## 🚀 快速开始

### 1. 创建项目

```bash

npm createvite@latestyour-project-name----templatevue

cd your-project-name

```

### 2. 安装依赖

```bash

# 安装 pnpm

npm install-gpnpm


# 核心依赖

pnpm addvue@^3.3.9vue-router@^4.2.5pinia@^2.1.7

pnpm addelement-plus@^2.4.3@element-plus/icons-vue@^2.3.1

pnpm addaxiospinia-plugin-persistedstate


# 开发依赖

pnpm add-D@vitejs/plugin-vuesasseslintprettier

pnpm add-Deslint-plugin-vueeslint-config-prettier

```

### 3. 创建目录结构

```bash

mkdir -psrc/{api,assets/{images,icons},components,layout,router,store/modules,utils,views/{login,dashboard,system}}

```

## 🛠 技术栈

-**框架**: Vue 3.3.9 (Composition API + `<script setup>`)

-**UI 库**: Element Plus 2.4.3

-**构建**: Vite 5.2.12 | **包管理**: pnpm

-**状态**: Pinia + 持久化 | **路由**: Vue Router

-**样式**: SCSS | **代码规范**: ESLint + Prettier

## 📁 项目结构

```

src/

├── api/                    # API接口管理

├── assets/                 # 静态资源

├── components/             # 全局组件

├── layout/                 # 布局组件

├── router/                 # 路由配置

├── store/modules/          # 状态管理

├── utils/                  # 工具函数

├── views/                  # 页面组件

│   ├── login/             # 登录

│   ├── dashboard/         # 仪表板

│   └── system/            # 系统管理

├── App.vue                # 根组件

└── main.js                # 入口文件

```

## 💻 开发规范

### 组件结构

```vue

<template>

  <div class="container">

    <el-button @click="handleClick">按钮</el-button>

  </div>

</template>


<script setup>

import { ref, onMounted } from 'vue';

import { ElMessage } from 'element-plus';


// 响应式数据

const loading = ref(false);


// 方法

async function handleClick() {

  try {

    loading.value = true;

    // 业务逻辑

    ElMessage.success('操作成功');

  } catch (error) {

    ElMessage.error('操作失败');

  } finally {

    loading.value = false;

  }

}


onMounted(() => {

  // 初始化

});

</script>


<style scoped>

.container {

  padding: 16px;

}

</style>

```

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

## 🤖 Cursor AI 使用指南

### 如何使用

1. 将 `CURSOR_DEV_PROMPT.md` 文件内容复制到 Cursor 的对话框中作为上下文
2. 根据具体开发需求，参考以下场景使用对应的提示词

### 常用开发场景

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

- `search`（搜索）、`home`（首页）、`setting`（设置）、`config`（配置）
- `bookmark`（书签）、`camera`（相机）、`equalizer`（均衡器）、`radar`（雷达）
- `zoom-in` / `zoom-out`（缩放）、`refresh`（刷新）、`save`（保存）

### 目录与提交约束

- 不将图标 SVG 手动复制到仓库，统一从 `@icon-park/vue-next` 引入。
- 若需要自定义图标，统一放置在 `src/assets/icons` 并注明来源与许可。
