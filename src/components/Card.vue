<script setup lang="ts">
// Surface primitive only — NO intrinsic padding (MUI-"Card" model). Padding
// lives in CardHeader / CardBody / CardFooter so a card can hold flush regions
// (media, tables, split headers). Simple case: <Card><CardBody>…</CardBody></Card>.
withDefaults(
  defineProps<{
    variant?: 'elevated' | 'outlined'
    hoverable?: boolean
  }>(),
  { variant: 'elevated', hoverable: false },
)
</script>

<template>
  <div
    :class="[
      'nv-card',
      `nv-card--${variant}`,
      { 'nv-card--hoverable': hoverable },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.nv-card {
  position: relative;
  border-radius: var(--card-radius);
  overflow: hidden;
  transition: var(--transition);
}

.nv-card--elevated {
  background: linear-gradient(145deg, var(--surface), var(--bg-alt));
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
}

.nv-card--outlined {
  background: var(--surface);
  border: 1px solid var(--border);
}

.nv-card--hoverable:hover {
  background: var(--surface-hover);
  border-color: var(--border-alt);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
</style>
