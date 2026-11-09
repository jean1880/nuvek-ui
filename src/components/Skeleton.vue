<script setup lang="ts">
// Loading placeholder. Size it with a utility class: <Skeleton class="h-4 w-32" />.
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    aria-hidden="true"
    :class="
      cn(
        'motion-safe:animate-shimmer rounded-md bg-surface bg-linear-to-r from-surface via-surface-hover to-surface bg-size-[200%_100%]',
        props.class,
      )
    "
  />
</template>
