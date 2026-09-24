<script setup lang="ts">
// Reka UI's Toast owns the behaviour: an aria-live region (errors announce assertively),
// a per-toast timer that pauses on hover/focus and window blur, swipe-to-dismiss, and an
// F8 hotkey to jump into the stack. When a toast ends for ANY reason this emits `dismiss`
// so the owner (useToasts) drops it.
import type { HTMLAttributes } from 'vue'
import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastViewport } from 'reka-ui'
import { cva } from 'class-variance-authority'
import type { Toast, ToastType } from '../composables/useToasts'
import { cn } from '../lib/cn'

const props = withDefaults(
  defineProps<{
    toasts: Toast[]
    /** Show a per-toast close button. Timeout and swipe dismissal work either way. */
    dismissible?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { dismissible: true },
)

const emit = defineEmits<{ dismiss: [id: number] }>()

const iconVariants = cva('flex size-6 shrink-0 items-center justify-center rounded-full', {
  variants: {
    type: {
      success: 'bg-success/15 text-success',
      error: 'bg-error/15 text-error',
      warning: 'bg-warning/15 text-warning',
      info: 'bg-primary/15 text-primary',
    } satisfies Record<ToastType, string>,
  },
})

function onOpenChange(id: number, open: boolean) {
  if (!open) emit('dismiss', id)
}
</script>

<template>
  <ToastProvider swipe-direction="right">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :duration="toast.duration"
      :type="toast.type === 'error' ? 'foreground' : 'background'"
      class="flex items-center gap-4 rounded-lg border border-border-strong bg-bg-modal px-6 py-4 text-sm font-bold text-fg shadow-xl data-[state=closed]:animate-toast-out data-[state=open]:animate-toast-in data-[swipe=move]:translate-x-(--reka-toast-swipe-move-x) data-[swipe=end]:animate-toast-out"
      @update:open="onOpenChange(toast.id, $event)"
    >
      <div :class="iconVariants({ type: toast.type })" aria-hidden="true">
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
      </div>
      <ToastDescription class="flex-auto">{{ toast.msg }}</ToastDescription>
      <ToastClose
        v-if="dismissible"
        aria-label="Dismiss notification"
        class="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-fg-dim transition hover:bg-surface-hover hover:text-fg"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </ToastClose>
    </ToastRoot>

    <ToastViewport
      :class="cn('fixed end-8 bottom-8 z-(--z-toast) m-0 flex list-none flex-col gap-3 p-0 outline-none', props.class)"
    />
  </ToastProvider>
</template>
