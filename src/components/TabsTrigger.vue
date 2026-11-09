<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsTrigger } from 'reka-ui'
import { cn } from '../lib/cn'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    :class="
      cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-fg-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-primary',
        props.class,
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
