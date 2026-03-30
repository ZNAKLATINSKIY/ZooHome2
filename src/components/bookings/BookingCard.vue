<template>
  <div class="booking-card card">
    <div class="booking-img-wrap">
      <img
        :src="booking.animalImage || fallback"
        :alt="booking.animalName"
        class="booking-img"
        @error="e => e.target.src = fallback"
      />
    </div>
    <div class="booking-body">
      <div class="booking-top">
        <div>
          <h3 class="booking-name">{{ booking.animalName }}</h3>
          <p class="booking-species">{{ booking.animalSpecies }} · {{ booking.animalBreed }}</p>
        </div>
        <span :class="['status-badge', 'badge', `status-${booking.status}`]">
          {{ statusLabel }}
        </span>
      </div>

      <div class="booking-details">
        <div class="booking-detail">
          <span class="detail-icon">📅</span>
          <span>{{ formatDate(booking.visitDate) }}</span>
        </div>
        <div class="booking-detail">
          <span class="detail-icon">💰</span>
          <span>{{ formatPrice(booking.price) }} ₸</span>
        </div>
        <div v-if="booking.notes" class="booking-detail booking-note">
          <span class="detail-icon">📝</span>
          <span>{{ booking.notes }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="!readOnly" class="booking-actions">
        <RouterLink :to="`/animal/${booking.animalId}`" class="btn btn-outline btn-sm">
          Посмотреть питомца
        </RouterLink>
        <button
          v-if="booking.status === 'pending'"
          class="btn btn-danger btn-sm"
          @click="$emit('cancel')"
        >Отменить</button>
        <button
          v-if="booking.status === 'cancelled'"
          class="btn btn-ghost btn-sm"
          @click="$emit('delete')"
        >Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  booking: Object,
  readOnly: { type: Boolean, default: false }
})
defineEmits(['cancel', 'delete'])

const fallback = 'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=300&q=60'

const statusLabels = {
  pending: '⏳ Ожидает',
  confirmed: '✅ Подтверждено',
  completed: '✓ Завершено',
  cancelled: '✗ Отменено'
}
const statusLabel = statusLabels[props.booking.status] || props.booking.status

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatPrice(p) { return p?.toLocaleString('ru-RU') || '0' }
</script>

<style scoped>
.booking-card {
  display: flex;
  flex-direction: row;
  overflow: visible;
  gap: 0;
}
.booking-card:hover { transform: none; }

.booking-img-wrap {
  width: 140px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}
.booking-img { width: 100%; height: 100%; object-fit: cover; }

.booking-body {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.booking-name { font-size: 20px; font-family: var(--font-display); }
.booking-species { font-size: 13px; color: var(--stone); margin-top: 2px; }

.status-badge { font-size: 13px; white-space: nowrap; }

.booking-details { display: flex; flex-wrap: wrap; gap: 12px 24px; }
.booking-detail { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--stone); }
.detail-icon { font-size: 16px; }
.booking-note { width: 100%; }

.booking-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }

@media (max-width: 600px) {
  .booking-card { flex-direction: column; }
  .booking-img-wrap { width: 100%; height: 180px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
}
</style>
