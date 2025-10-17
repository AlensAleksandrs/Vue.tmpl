import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const loading = document.getElementById('loading')

app.use(createPinia())
app.use(router)

app.mount('#app')
if (loading) loading.remove()
