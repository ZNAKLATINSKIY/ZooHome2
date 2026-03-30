<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-icon">🐾</span>
        <span class="logo-text">ZooHome</span>
      </RouterLink>

      <nav class="nav desktop-nav">
        <RouterLink to="/" class="nav-link">Питомцы</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/bookings" class="nav-link">
          Мои записи
          <span v-if="bookingCount > 0" class="nav-badge">{{ bookingCount }}</span>
        </RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="nav-link admin-link">
          ⚙️ Панель
        </RouterLink>
      </nav>

      <div class="header-auth">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/profile" class="avatar-btn" :title="auth.displayName">
            <span class="avatar">{{ initials }}</span>
          </RouterLink>
          <button class="btn btn-ghost btn-sm" @click="handleLogout">Выйти</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-primary btn-sm">Войти</RouterLink>
        </template>

        <button class="burger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-menu">
        <RouterLink to="/" class="mobile-link" @click="mobileOpen = false">🐱 Питомцы</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/bookings" class="mobile-link" @click="mobileOpen = false">📅 Мои записи</RouterLink>
        <RouterLink v-if="auth.isLoggedIn" to="/profile" class="mobile-link" @click="mobileOpen = false">👤 Профиль</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="mobile-link" @click="mobileOpen = false">⚙️ Админ</RouterLink>
        <div class="mobile-divider" />
        <template v-if="auth.isLoggedIn">
          <button class="mobile-link mobile-logout" @click="handleLogout">🚪 Выйти</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="mobile-link" @click="mobileOpen = false">🔑 Войти / Регистрация</RouterLink>
        </template>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { useBookingsStore } from '@/store/bookings.js'
import { useToast } from '@/composables/useToast.js'

const auth = useAuthStore()
const bookingsStore = useBookingsStore()
const router = useRouter()
const { success } = useToast()

const mobileOpen = ref(false)
const isScrolled = ref(false)

const initials = computed(() => {
  const name = auth.displayName
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const bookingCount = computed(() => bookingsStore.activeBookings.length)

async function handleLogout() {
  await auth.logout()
  mobileOpen.value = false
  router.push('/')
  success('Вы вышли из аккаунта')
}

function onScroll() { isScrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 247, 242, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.header.scrolled {
  border-color: var(--parchment);
  box-shadow: var(--shadow-sm);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--charcoal);
  white-space: nowrap;
}
.logo-icon { font-size: 26px; }
.logo:hover .logo-text { color: var(--forest); }

.nav { display: flex; align-items: center; gap: 4px; flex: 1; }

.nav-link {
  position: relative;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--stone);
  transition: all var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link:hover, .nav-link.router-link-active {
  color: var(--forest);
  background: rgba(61, 90, 62, 0.08);
}

.nav-badge {
  background: var(--rust);
  color: white;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.admin-link { color: var(--caramel); }

.header-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.avatar-btn { display: flex; align-items: center; }
.avatar {
  width: 36px; height: 36px;
  background: var(--forest);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition);
}
.avatar:hover { transform: scale(1.05); }

.burger {
  display: none;
  width: 36px; height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 4px;
}
.burger span,
.burger span::before,
.burger span::after {
  display: block;
  width: 22px; height: 2px;
  background: var(--charcoal);
  border-radius: 2px;
  transition: all 0.3s;
  position: relative;
}
.burger span::before,
.burger span::after {
  content: '';
  position: absolute;
}
.burger span::before { top: -7px; }
.burger span::after { top: 7px; }
.burger span.open { background: transparent; }
.burger span.open::before { transform: rotate(45deg); top: 0; }
.burger span.open::after { transform: rotate(-45deg); top: 0; }

.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: 12px 20px 20px;
  background: var(--warm-white);
  border-top: 1px solid var(--parchment);
}
.mobile-link {
  padding: 14px 8px;
  font-size: 16px;
  color: var(--charcoal);
  border-bottom: 1px solid var(--parchment);
  transition: color var(--transition);
  display: block;
  background: none;
  border: none;
  border-bottom: 1px solid var(--parchment);
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.mobile-link:last-child { border-bottom: none; }
.mobile-link:hover { color: var(--forest); }
.mobile-divider { height: 1px; background: var(--parchment); margin: 4px 0; }
.mobile-logout { color: var(--rust) !important; }

.mobile-menu-enter-active, .mobile-menu-leave-active { transition: all 0.25s ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 768px) {
  .desktop-nav { display: none; }
  .burger { display: flex; }
  .btn-ghost { display: none; }
}
</style>
