<template>
  <div class="page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Мои записи</h1>
          <p class="page-subtitle">Управляйте своими визитами в питомник</p>
        </div>
        <div class="tab-switcher">
          <button :class="['tab-btn', { active: tab === 'active' }]" @click="tab = 'active'">
            Активные
            <span v-if="bookingsStore.activeBookings.length" class="count-badge">{{ bookingsStore.activeBookings.length }}</span>
          </button>
          <button :class="['tab-btn', { active: tab === 'history' }]" @click="loadHistory">История</button>
        </div>
      </div>

      <!-- Active bookings (real-time) -->
      <div v-if="tab === 'active'">
        <div v-if="bookingsStore.activeBookings.length === 0" class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3>Нет активных записей</h3>
          <p>Запишитесь на знакомство с понравившимся питомцем</p>
          <RouterLink to="/" class="btn btn-primary">Смотреть питомцев</RouterLink>
        </div>

        <div v-else class="bookings-list">
          <TransitionGroup name="slide-up">
            <BookingCard
              v-for="booking in bookingsStore.activeBookings"
              :key="booking.id"
              :booking="booking"
              @cancel="cancelBooking(booking.id)"
              @delete="deleteBooking(booking.id)"
            />
          </TransitionGroup>
        </div>
      </div>

      <!-- History tab -->
      <div v-else-if="tab === 'history'">
        <div v-if="bookingsStore.loading"><div class="spinner"></div></div>
        <div v-else-if="bookingsStore.history.length === 0" class="empty-state">
          <div class="empty-state-icon">🕐</div>
          <h3>История пуста</h3>
          <p>Завершённые или отменённые записи появятся здесь</p>
        </div>
        <div v-else class="bookings-list">
          <BookingCard
            v-for="booking in bookingsStore.history"
            :key="booking.id"
            :booking="booking"
            :read-only="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth.js'
import { useBookingsStore } from '@/store/bookings.js'
import { useToast } from '@/composables/useToast.js'
import BookingCard from '@/components/bookings/BookingCard.vue'

const auth = useAuthStore()
const bookingsStore = useBookingsStore()
const { success, error } = useToast()

const tab = ref('active')

async function cancelBooking(id) {
  try {
    await bookingsStore.cancelBooking(id)
    success('Запись отменена')
  } catch { error('Ошибка при отмене') }
}

async function deleteBooking(id) {
  try {
    await bookingsStore.deleteBooking(id)
    success('Запись удалена')
  } catch { error('Ошибка при удалении') }
}

async function loadHistory() {
  tab.value = 'history'
  await bookingsStore.fetchHistory(auth.user.uid)
}

onMounted(() => {
  bookingsStore.subscribeActiveBookings(auth.user.uid)
})

onUnmounted(() => {
  bookingsStore.stopActiveSubscription()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}

.tab-switcher {
  display: flex;
  background: var(--parchment);
  border-radius: var(--radius-lg);
  padding: 4px;
}
.tab-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px;
  border: none; background: transparent;
  border-radius: var(--radius-md);
  font-size: 14px; font-weight: 500;
  color: var(--stone);
  cursor: pointer;
  transition: all var(--transition);
}
.tab-btn.active { background: white; color: var(--charcoal); box-shadow: var(--shadow-sm); }
.count-badge {
  background: var(--rust); color: white;
  font-size: 11px; min-width: 18px; height: 18px;
  border-radius: 9px; display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}
.bookings-list { display: flex; flex-direction: column; gap: 16px; }
</style>
