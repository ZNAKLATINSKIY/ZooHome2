// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './store/auth.js'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Wait for auth to initialize before mounting
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})
