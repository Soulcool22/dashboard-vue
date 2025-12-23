import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { install } from '@icon-park/vue-next/es/all'
import '@icon-park/vue-next/styles/index.css' // <-- ADD THIS LINE
import './assets/dashboard.css'
import App from './App.vue'

// 初始化数据适配器
import { setDataAdapter } from './services/dataService'
import { csvAdapter } from './services/adapters/csvAdapter'
setDataAdapter(csvAdapter)

const app = createApp(App)
app.use(ElementPlus)
app.use(install)
app.mount('#app')
