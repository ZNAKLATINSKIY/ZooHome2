<template>
  <div class="review-card">
    <div class="review-header">
      <div class="reviewer-avatar">{{ initials }}</div>
      <div class="reviewer-info">
        <strong>{{ review.userName || 'Аноним' }}</strong>
        <span class="review-date">{{ dateStr }}</span>
      </div>
      <StarsDisplay :rating="review.rating" />
      <button v-if="canDelete" class="delete-btn" @click="$emit('delete')" title="Удалить">🗑</button>
    </div>
    <p class="review-text">{{ review.text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StarsDisplay from '@/components/ui/StarsDisplay.vue'

const props = defineProps({
  review: Object,
  canDelete: Boolean
})
defineEmits(['delete'])

const initials = computed(() => {
  const n = props.review.userName || 'A'
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const dateStr = computed(() => {
  try {
    const d = props.review.createdAt?.toDate?.() || new Date(props.review.createdAt)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return '' }
})
</script>

<style scoped>
.review-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  border: 1.5px solid var(--parchment);
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.reviewer-avatar {
  width: 38px; height: 38px;
  background: var(--forest);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600;
  flex-shrink: 0;
}
.reviewer-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.reviewer-info strong { font-size: 14px; color: var(--charcoal); }
.review-date { font-size: 12px; color: var(--mist); }
.review-text { color: var(--stone); font-size: 14px; line-height: 1.6; }
.delete-btn {
  margin-left: auto;
  background: transparent; border: none; cursor: pointer;
  font-size: 16px; opacity: 0.5; transition: opacity var(--transition);
}
.delete-btn:hover { opacity: 1; }
</style>
