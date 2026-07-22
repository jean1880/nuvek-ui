<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{
  title?: string
}>()

const slots = useSlots()
</script>

<template>
  <section class="nv-panel">
    <header v-if="title || slots.header" class="nv-panel__header">
      <slot name="header">{{ title }}</slot>
    </header>
    <div class="nv-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.nv-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.nv-panel__header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.nv-panel__body {
  padding: var(--space-4);
}
</style>
