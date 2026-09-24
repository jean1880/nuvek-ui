<script setup lang="ts">
// Padded content region of a Card.
import type { HTMLAttributes } from 'vue'
import { cn } from '../lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('p-6', props.class)"><slot /></div>
</template>
