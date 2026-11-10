<script setup lang="ts">
// Internal: the optional close button of Modal and Drawer. Not part of the public API.
import { DialogClose } from 'reka-ui'

defineProps<{ label: string }>()
</script>

<template>
  <DialogClose
    :aria-label="label"
    class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-muted transition hover:bg-surface-hover hover:text-fg"
  >
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  </DialogClose>
</template>
