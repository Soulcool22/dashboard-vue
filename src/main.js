import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { install } from '@icon-park/vue-next/es/all'
import '@icon-park/vue-next/styles/index.css' // <-- ADD THIS LINE
import './assets/dashboard.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(install)
app.mount('#app')
