<script setup lang="ts">
// Determinate progress. Reka Progress owns role/aria; value is clamped to 0..max here
// (Reka would otherwise reset an out-of-range value to indeterminate).
import { computed, type HTMLAttributes } from 'vue'
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const indicatorVariants = cva('h-full rounded-full transition-[width]', {
  variants: {
    intent: {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    },
  },
  defaultVariants: { intent: 'primary' },
})

type IndicatorVariants = VariantProps<typeof indicatorVariants>

const props = withDefaults(
  defineProps<{
    value: number
    max: number
    intent?: NonNullable<IndicatorVariants['intent']>
    /** Accessible name; defaults to the percentage. */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  { intent: 'primary' },
)

const safeMax = computed(() => (Number.isFinite(props.max) && props.max > 0 ? props.max : 100))
const clamped = computed(() => {
  const v = Number.isFinite(props.value) ? props.value : 0
  return Math.min(Math.max(v, 0), safeMax.value)
})
const percent = computed(() => (clamped.value / safeMax.value) * 100)

function valueLabel(value: number | null | undefined, max: number) {
  return props.label ?? (typeof value === 'number' ? `${Math.round((value / max) * 100)}%` : undefined)
}
</script>

<template>
  <ProgressRoot
    :model-value="clamped"
    :max="safeMax"
    :get-value-label="valueLabel"
    :class="cn('h-2 w-full overflow-hidden rounded-full bg-surface-hover', props.class)"
  >
    <ProgressIndicator :class="indicatorVariants({ intent })" :style="{ width: `${percent}%` }" />
  </ProgressRoot>
</template>
