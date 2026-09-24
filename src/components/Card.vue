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
  },
  defaultVariants: { variant: 'elevated', hoverable: false },
})

type CardVariants = VariantProps<typeof cardVariants>

const props = withDefaults(
  defineProps<{
    variant?: NonNullable<CardVariants['variant']>
    hoverable?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'elevated', hoverable: false },
)
</script>

<template>
  <div :class="cn(cardVariants({ variant, hoverable }), props.class)">
    <slot />
  </div>
</template>
