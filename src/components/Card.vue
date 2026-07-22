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
  box-shadow: var(--card-shadow);
  transition: var(--transition);
}

.nv-card--hoverable:hover {
  background: var(--surface-hover);
  border-color: var(--border-alt);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
</style>
