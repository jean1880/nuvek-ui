<script setup lang="ts">
withDefaults(
  defineProps<{
    hoverable?: boolean
  }>(),
  { hoverable: false },
)
</script>

<template>
  <div :class="['nv-card', { 'nv-card--hoverable': hoverable }]">
    <slot />
  </div>
</template>

<style scoped>
.nv-card {
  position: relative;
  background: linear-gradient(145deg, var(--surface), var(--bg-alt));
  border: 1px solid var(--border);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05); /* subtle rim light */
  transition: var(--transition);
}

.nv-card--hoverable:hover {
  background: var(--surface-hover);
  border-color: var(--border-alt);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
</style>
