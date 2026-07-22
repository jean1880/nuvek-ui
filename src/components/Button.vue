<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="['nv-btn', `nv-btn--${variant}`]">
    <slot />
  </button>
</template>

<style scoped>
.nv-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--btn-radius);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: var(--transition);
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
  white-space: nowrap;
}

.nv-btn--primary {
  background: var(--primary);
  color: var(--bg);
}
.nv-btn--primary:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: 0 0 15px var(--primary-soft);
  transform: translateY(-1px);
}

.nv-btn--ghost {
  background: transparent;
  color: var(--text-muted);
}
.nv-btn--ghost:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--border-alt);
}

.nv-btn--danger {
  background: color-mix(in srgb, var(--error) 10%, transparent);
  color: var(--error);
  border-color: var(--error-border);
}
.nv-btn--danger:hover:not(:disabled) {
  background: var(--error);
  color: #fff;
}

.nv-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}
</style>
