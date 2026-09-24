<script setup lang="ts">
// Padded card region with a bottom divider. Default slot for the title cluster;
// #actions slot for trailing controls.
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('flex items-center gap-4 border-b border-border px-6 py-4', props.class)">
    <div class="min-w-0 flex-1"><slot /></div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
