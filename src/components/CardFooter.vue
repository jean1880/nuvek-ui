<script setup lang="ts">
// Padded card region with a top divider — typically trailing actions (MUI-"CardActions").
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('flex items-center gap-2 border-t border-border px-6 py-4', props.class)">
    <slot />
  </div>
</template>
