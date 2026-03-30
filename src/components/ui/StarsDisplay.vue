<template>
  <div class="stars">
    <span
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ filled: i <= Math.round(rating) }"
    >★</span>
    <span v-if="showNumber" class="rating-number">{{ rating?.toFixed(1) }}</span>
  </div>
</template>

<script setup>
defineProps({
  rating: { type: Number, default: 0 },
  showNumber: { type: Boolean, default: false }
})
</script>

<style scoped>
.stars { display: inline-flex; align-items: center; gap: 2px; }
.star { color: var(--parchment); font-size: 14px; line-height: 1; }
.star.filled { color: var(--rust); }
.rating-number { font-size: 13px; color: var(--stone); margin-left: 4px; }
</style>
