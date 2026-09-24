<script setup lang="ts">
// Controlled dialog. Reka UI owns the behaviour — portal to <body>, focus trap and
// restore, reentrant body-scroll lock, Esc/outside dismissal, role/aria-modal/labelling —
// so this component only maps nuvek's props onto it and styles the parts.
import type { HTMLAttributes } from 'vue'
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui'
import { cn } from '../lib/cn'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    /** Accessible name used when neither `title` nor a `header` slot is provided. */
    ariaLabel?: string
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { open: false, closeOnBackdrop: true, closeOnEsc: true },
)

const emit = defineEmits<{ close: [] }>()

function onOpenChange(next: boolean) {
  if (!next) emit('close')
}

// Reka fires these before dismissing; preventDefault keeps the dialog open.
function onOutside(e: Event) {
  if (!props.closeOnBackdrop) e.preventDefault()
}
function onEsc(e: KeyboardEvent) {
  if (!props.closeOnEsc) e.preventDefault()
}
</script>

<template>
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-(--z-modal) bg-overlay backdrop-blur-sm data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in"
      />
      <!-- Centred without a transform (inset + auto margins + h-fit), so the
           translate-based enter/exit animation owns `transform` alone. -->
      <DialogContent
        :aria-describedby="undefined"
        :class="
          cn(
            'fixed inset-4 z-(--z-modal) m-auto flex h-fit max-h-9/10 max-w-lg flex-col overflow-hidden rounded-lg border border-border-strong bg-bg-modal shadow-xl focus:outline-none data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in',
            props.class,
          )
        "
        @pointer-down-outside="onOutside"
        @focus-outside="onOutside"
        @escape-key-down="onEsc"
      >
        <DialogTitle
          v-if="title || $slots.header"
          as="header"
          class="border-b border-border px-6 py-4 text-lg font-bold text-fg"
        >
          <slot name="header">{{ title }}</slot>
        </DialogTitle>
        <VisuallyHidden v-else>
          <DialogTitle>{{ ariaLabel }}</DialogTitle>
        </VisuallyHidden>

        <div class="overflow-y-auto p-6">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t border-border px-6 py-4">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
