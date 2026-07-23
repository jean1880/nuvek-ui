<script setup lang="ts">
// Padded card region with a top divider — typically trailing actions (MUI-"CardActions").
</script>

<template>
  <div class="nv-card-footer"><slot /></div>
</template>

<style scoped>
.nv-card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-4);
  padding-inline: var(--space-6);
  border-block-start: 1px solid var(--border);
}
</style>
