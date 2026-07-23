<script setup lang="ts">
// Padded card region with a bottom divider. Default slot for the title cluster;
// #actions slot for trailing controls (right-aligned via :has-aware layout).
</script>

<template>
  <div class="nv-card-header">
    <div class="nv-card-header__lead"><slot /></div>
    <div v-if="$slots.actions" class="nv-card-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.nv-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
  padding-inline: var(--space-6);
  border-block-end: 1px solid var(--border);
}
.nv-card-header__lead {
  min-inline-size: 0;
  flex: 1;
}
.nv-card-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
</style>
