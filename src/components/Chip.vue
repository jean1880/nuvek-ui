<script setup lang="ts">
// Compact status/attribute pill (MUI-"Chip", not "Badge"/count-overlay).
// Two orthogonal axes: `color` (semantic intent) x `variant` (visual weight),
// composed from a single --chip-color custom property via color-mix so the six
// colours need one rule each instead of one-per-colour-per-variant.
withDefaults(
  defineProps<{
    color?: 'success' | 'error' | 'warning' | 'running' | 'idle' | 'neutral'
    variant?: 'soft' | 'filled' | 'outlined'
    size?: 'sm' | 'md'
  }>(),
  { color: 'neutral', variant: 'soft', size: 'md' },
)
</script>

<template>
  <span
    :class="[
      'nv-chip',
      `nv-chip--${color}`,
      `nv-chip--${variant}`,
      `nv-chip--${size}`,
    ]"
  >
    <slot />
  </span>
</template>

<style scoped>
.nv-chip {
  --_c: var(--chip-color, var(--text-muted));
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border-radius: var(--radius-full);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border: 1px solid transparent;
  transition: var(--transition);
  white-space: nowrap;
}

/* Size axis */
.nv-chip--md {
  font-size: var(--text-xs);
  padding-block: var(--space-1);
  padding-inline: var(--space-3);
}
.nv-chip--sm {
  font-size: 0.6875rem;
  padding-block: calc(var(--space-1) / 2);
  padding-inline: var(--space-2);
}

/* Colour axis — one line each, feeds the shared --_c */
.nv-chip--success { --chip-color: var(--success); }
.nv-chip--error { --chip-color: var(--error); }
.nv-chip--warning { --chip-color: var(--warning); }
.nv-chip--running { --chip-color: var(--primary); }
.nv-chip--idle { --chip-color: var(--idle); }
.nv-chip--neutral { --chip-color: var(--text-muted); }

/* Variant axis — derives every surface from --_c via color-mix */
.nv-chip--soft {
  background: color-mix(in srgb, var(--_c) 12%, transparent);
  color: var(--_c);
  border-color: color-mix(in srgb, var(--_c) 30%, transparent);
}
.nv-chip--filled {
  background: var(--_c);
  color: var(--bg);
  border-color: transparent;
}
.nv-chip--outlined {
  background: transparent;
  color: var(--_c);
  border-color: color-mix(in srgb, var(--_c) 45%, transparent);
}
</style>
