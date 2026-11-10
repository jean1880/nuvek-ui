<script setup lang="ts">
// A non-interactive heading for a group of rows.
import type { HTMLAttributes } from 'vue'
import { DropdownMenuLabel } from 'reka-ui'
import { cn } from '../lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DropdownMenuLabel :class="cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg-dim', props.class)">
    <slot />
  </DropdownMenuLabel>
</template>
