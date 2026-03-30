<template>
  <div class="auth-page">
    <div class="auth-visual">
      <div class="auth-visual-content">
        <div class="auth-logo">🐾 ZooHome</div>
        <h2>Добро пожаловать в наш питомник</h2>
        <p>Войдите, чтобы записаться на знакомство с питомцем и сохранять избранное</p>
      </div>
    </div>

    <div class="auth-form-side">
      <div class="auth-form-wrap">
        <!-- Tabs -->
        <div class="auth-tabs">
          <button :class="['tab', { active: mode === 'login' }]" @click="mode = 'login'">Войти</button>
          <button :class="['tab', { active: mode === 'register' }]" @click="mode = 'register'">Регистрация</button>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="alert alert-error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

        <!-- Login form -->
        <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-input" placeholder="you@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
          </div>
          <button type="button" class="forgot-link" @click="handleReset">Забыли пароль?</button>
          <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="loading">
            {{ loading ? 'Входим…' : 'Войти' }}
          </button>
        </form>

        <!-- Register form -->
        <form v-else @submit.prevent="handleRegister" class="form">
          <div class="form-group">
            <label class="form-label">Имя</label>
            <input v-model="displayName" type="text" class="form-input" placeholder="Ваше имя" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-input" placeholder="you@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input v-model="password" type="password" class="form-input" placeholder="Минимум 6 символов" required minlength="6" />
          </div>
          <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="loading">
            {{ loading ? 'Регистрируем…' : 'Создать аккаунт' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const auth = useAuthStore()
const { success } = useToast()

const mode = ref('login')
const email = ref('')
const password = ref('')
const displayName = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const firebaseErrors = {
  'auth/user-not-found': 'Пользователь не найден',
  'auth/wrong-password': 'Неверный пароль',
  'auth/email-already-in-use': 'Email уже используется',
  'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
  'auth/invalid-email': 'Некорректный email',
  'auth/invalid-credential': 'Неверный email или пароль',
  'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже'
}

function getErrorMsg(e) {
  return firebaseErrors[e.code] || e.message
}

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    success('Добро пожаловать! 🐾')
    router.push('/')
  } catch (e) {
    errorMsg.value = getErrorMsg(e)
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.register(email.value, password.value, displayName.value)
    success('Аккаунт создан! 🎉')
    router.push('/')
  } catch (e) {
    errorMsg.value = getErrorMsg(e)
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  if (!email.value) {
    errorMsg.value = 'Введите email для сброса пароля'
    return
  }
  loading.value = true
  try {
    await auth.resetPassword(email.value)
    successMsg.value = 'Письмо со сбросом пароля отправлено!'
    errorMsg.value = ''
  } catch (e) {
    errorMsg.value = getErrorMsg(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.auth-visual {
  background: var(--charcoal);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}
.auth-visual::before {
  content: '';
  position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1000&q=60') center/cover;
  opacity: 0.2;
}
.auth-visual-content { position: relative; z-index: 1; color: white; max-width: 360px; }
.auth-logo { font-size: 24px; font-family: var(--font-display); margin-bottom: 32px; }
.auth-visual-content h2 { font-size: 32px; line-height: 1.2; margin-bottom: 16px; }
.auth-visual-content p { color: rgba(255,255,255,0.65); line-height: 1.6; }

.auth-form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--warm-white);
  padding: 40px 20px;
}
.auth-form-wrap { width: 100%; max-width: 380px; }

.auth-tabs {
  display: flex;
  background: var(--parchment);
  border-radius: var(--radius-lg);
  padding: 4px;
  margin-bottom: 28px;
}
.tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  color: var(--stone);
  cursor: pointer;
  transition: all var(--transition);
}
.tab.active { background: white; color: var(--charcoal); box-shadow: var(--shadow-sm); }

.form { display: flex; flex-direction: column; gap: 16px; }
.forgot-link {
  background: none; border: none;
  color: var(--caramel); font-size: 13px;
  cursor: pointer; text-align: right;
  margin-top: -8px;
  transition: color var(--transition);
}
.forgot-link:hover { color: var(--rust); }
.submit-btn { width: 100%; justify-content: center; margin-top: 8px; }

@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-visual { display: none; }
}
</style>
