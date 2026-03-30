<template>
  <div class="star-rating">
    <span
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ active: i <= (hovered || modelValue) }"
      @mouseenter="hovered = i"
      @mouseleave="hovered = 0"
      @click="$emit('update:modelValue', i)"
    >★</span>
    <span class="rating-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ modelValue: { type: Number, default: 0 } })
defineEmits(['update:modelValue'])
const hovered = ref(0)
const label = computed(() => {
  const v = hovered.value || props.modelValue
  return ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'][v] || ''
})
</script>

<style scoped>
.star-rating { display: flex; align-items: center; gap: 4px; }
.star {
  font-size: 28px;
  color: var(--parchment);
  cursor: pointer;
  transition: color 0.15s, transform 0.15s;
  line-height: 1;
}
.star.active { color: var(--rust); }
.star:hover { transform: scale(1.15); }
.rating-label { font-size: 14px; color: var(--stone); margin-left: 8px; min-width: 70px; }
</style>
