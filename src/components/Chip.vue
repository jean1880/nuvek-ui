<script setup lang="ts">
// Compact status/attribute pill (MUI-"Chip", not "Badge"/count-overlay).
// Two orthogonal axes: `color` (semantic intent) × `variant` (visual weight). Each colour
// sets one custom property, --chip-c, and each variant derives every surface from it, so
// six colours need one class each instead of one per colour per variant.
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const chipVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-transparent font-semibold uppercase tracking-wide transition',
  {
    variants: {
      color: {
        success: '[--chip-c:var(--color-success)]',
        error: '[--chip-c:var(--color-error)]',
        warning: '[--chip-c:var(--color-warning)]',
        running: '[--chip-c:var(--color-primary)]',
        idle: '[--chip-c:var(--color-idle)]',
        neutral: '[--chip-c:var(--color-fg-muted)]',
      },
      variant: {
        soft: 'border-(--chip-c)/30 bg-(--chip-c)/12 text-(--chip-c)',
        filled: 'bg-(--chip-c) text-bg',
        outlined: 'border-(--chip-c)/45 bg-transparent text-(--chip-c)',
      },
      size: {
        md: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-2xs',
      },
    },
    defaultVariants: { color: 'neutral', variant: 'soft', size: 'md' },
  },
)

type ChipVariants = VariantProps<typeof chipVariants>

const props = withDefaults(
  defineProps<{
    color?: NonNullable<ChipVariants['color']>
    variant?: NonNullable<ChipVariants['variant']>
    size?: NonNullable<ChipVariants['size']>
    class?: HTMLAttributes['class']
  }>(),
  { color: 'neutral', variant: 'soft', size: 'md' },
)
</script>

<template>
  <span :class="cn(chipVariants({ color, variant, size }), props.class)">
    <slot />
  </span>
</template>
