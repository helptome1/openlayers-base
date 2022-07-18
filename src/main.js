import { createApp } from 'vue'
import App from './App.vue'
import router from './route/route'
// 引入全局css文件
import '/src/styles/init.css'

createApp(App).use(router).mount('#app')
