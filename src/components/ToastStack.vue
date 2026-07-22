<script setup lang="ts">
import type { Toast } from '../composables/useToasts'

defineProps<{ toasts: Toast[] }>()
</script>

<template>
  <div class="nv-toast-container">
    <TransitionGroup name="nv-toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['nv-toast', `nv-toast--${toast.type}`]"
        role="status"
      >
        <div class="nv-toast__icon">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        {{ toast.msg }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.nv-toast-container {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 2000;
}

.nv-toast {
  background: var(--bg-modal);
  border: 1px solid var(--border-alt);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  font-weight: 700;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--text);
}

.nv-toast__icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nv-toast--success .nv-toast__icon {
  background: var(--status-bg-success);
  color: var(--success);
}
.nv-toast--error .nv-toast__icon {
  background: var(--status-bg-error);
  color: var(--error);
}
.nv-toast--warning .nv-toast__icon,
.nv-toast--info .nv-toast__icon {
  background: var(--status-bg-warning);
  color: var(--warning);
}

.nv-toast-list-enter-active,
.nv-toast-list-leave-active {
  transition: all 0.3s ease;
}
.nv-toast-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.nv-toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
