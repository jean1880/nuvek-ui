<script setup lang="ts">
// Image avatar with an initials fallback (no src, or the image fails to load).
import { computed, type HTMLAttributes } from 'vue'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const avatarVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-hover font-semibold text-fg-muted',
  {
    variants: {
      size: {
        sm: 'size-6 text-2xs',
        md: 'size-8 text-xs',
        lg: 'size-12 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

type AvatarVariants = VariantProps<typeof avatarVariants>

const props = withDefaults(
  defineProps<{
    src?: string
    name: string
    size?: NonNullable<AvatarVariants['size']>
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md' },
)

// First character of the first two words; Array.from keeps surrogate pairs whole.
const initials = computed(
  () =>
    props.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join('')
      .toUpperCase() || '?',
)
const accessibleName = computed(() => props.name.trim() || 'Unknown')
</script>

<template>
  <AvatarRoot :class="cn(avatarVariants({ size }), props.class)">
    <AvatarImage v-if="src" :src="src" :alt="name" class="size-full object-cover" />
    <AvatarFallback :aria-label="accessibleName" role="img">{{ initials }}</AvatarFallback>
  </AvatarRoot>
</template>
