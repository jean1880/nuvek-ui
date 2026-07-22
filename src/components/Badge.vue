<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'success' | 'error' | 'running' | 'idle' | 'warning' | 'neutral'
  }>(),
  { variant: 'neutral' },
)
</script>

<template>
  <span :class="['nv-badge', `nv-badge--${variant}`]">
    <slot />
  </span>
</template>

<style scoped>
.nv-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border: 1px solid transparent;
  transition: var(--transition);
}

.nv-badge--success {
  background: color-mix(in srgb, var(--success) 12%, transparent);
  color: var(--success);
  border-color: var(--success-border);
}
.nv-badge--error {
  background: color-mix(in srgb, var(--error) 12%, transparent);
  color: var(--error);
  border-color: var(--error-border);
}
.nv-badge--running {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary-border);
}
.nv-badge--warning {
  background: color-mix(in srgb, var(--warning) 12%, transparent);
  color: var(--warning);
  border-color: var(--warning-border);
}
.nv-badge--idle {
  background: var(--idle-soft);
  color: var(--idle);
  border-color: var(--idle-border);
}
.nv-badge--neutral {
  background: var(--surface-hover);
  color: var(--text-muted);
  border-color: var(--border);
}
</style>
