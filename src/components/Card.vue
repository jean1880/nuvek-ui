<script setup lang="ts">
// Surface primitive only — NO intrinsic padding (MUI-"Card" model). Padding
// lives in CardHeader / CardBody / CardFooter so a card can hold flush regions
// (media, tables, split headers). Simple case: <Card><CardBody>…</CardBody></Card>.
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const cardVariants = cva('relative overflow-hidden rounded-lg border border-border transition', {
  variants: {
    variant: {
      elevated: 'bg-linear-145 from-surface to-bg-alt shadow-card',
      outlined: 'bg-surface',
    },
    hoverable: {
      true: 'hover:-translate-y-1 hover:border-border-strong hover:bg-surface-hover hover:bg-none hover:shadow-xl',
      false: '',
    },
    // The card clips its children (overflow-hidden), which also clips a full-bleed child's
    // focus ring. `interactive` draws the ring on the card itself while a child is
    // keyboard-focused, and keeps a transparent outline for forced-colours modes.
    interactive: {
      true: 'outline-2 outline-transparent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg',
      false: '',
    },
  },
  defaultVariants: { variant: 'elevated', hoverable: false, interactive: false },
})

type CardVariants = VariantProps<typeof cardVariants>

const props = withDefaults(
  defineProps<{
    variant?: NonNullable<CardVariants['variant']>
    hoverable?: boolean
    /** Show the focus ring on the card when a child has keyboard focus (full-bleed buttons). */
    interactive?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'elevated', hoverable: false, interactive: false },
)
</script>

<template>
  <div :class="cn(cardVariants({ variant, hoverable, interactive }), props.class)">
    <slot />
  </div>
</template>
