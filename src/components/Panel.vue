<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/cn'

const props = defineProps<{
  title?: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <section :class="cn('overflow-hidden rounded-lg border border-border bg-surface', props.class)">
    <header
      v-if="title || $slots.header"
      class="border-b border-border px-4 py-3 text-sm font-bold uppercase tracking-wider text-fg-muted"
    >
      <slot name="header">{{ title }}</slot>
    </header>
    <div class="p-4">
      <slot />
    </div>
  </section>
</template>
