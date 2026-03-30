<template>
  <div class="toast-container">
    <TransitionGroup name="toast-anim">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        <span v-if="toast.type === 'success'">✓ </span>
        <span v-else-if="toast.type === 'error'">✕ </span>
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast.js'
const { toasts } = useToast()
</script>

<style scoped>
.toast-anim-enter-active { transition: all 0.3s ease; }
.toast-anim-leave-active { transition: all 0.3s ease; }
.toast-anim-enter-from { opacity: 0; transform: translateX(30px); }
.toast-anim-leave-to { opacity: 0; transform: translateX(30px); }
</style>
