<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent px-4 py-2 font-sans text-sm font-bold uppercase tracking-wide transition select-none disabled:cursor-not-allowed disabled:opacity-40 disabled:grayscale aria-disabled:pointer-events-none aria-disabled:opacity-40 aria-disabled:grayscale',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-bg not-disabled:hover:-translate-y-px not-disabled:hover:bg-primary-hover not-disabled:hover:shadow-glow not-disabled:hover:shadow-primary/10',
        ghost:
          'bg-transparent text-fg-muted not-disabled:hover:border-border-strong not-disabled:hover:bg-surface-hover not-disabled:hover:text-fg',
        danger:
          'border-error/20 bg-error/10 text-error not-disabled:hover:bg-error not-disabled:hover:text-white',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      variant?: NonNullable<ButtonVariants['variant']>
      type?: 'button' | 'submit' | 'reset'
      disabled?: boolean
      class?: HTMLAttributes['class']
    }
  >(),
  { as: 'button', variant: 'primary', type: 'button', disabled: false },
)

// `type`/`disabled` only mean something on a real <button>; as a link or via asChild they
// would be invalid attributes, so they are dropped and disabled is expressed with ARIA.
const isNativeButton = computed(() => props.as === 'button' && !props.asChild)
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? disabled : undefined"
    :aria-disabled="!isNativeButton && disabled ? 'true' : undefined"
    :class="cn(buttonVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
