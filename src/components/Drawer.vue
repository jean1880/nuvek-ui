<script setup lang="ts">
// Controlled side sheet. Same Reka Dialog behaviour as Modal (portal, focus trap and
// restore, scroll lock, Esc/overlay dismissal, labelling); only the layout differs.
import type { HTMLAttributes } from 'vue'
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui'
import { cva } from 'class-variance-authority'
import { cn } from '../lib/cn'
import DialogCloseButton from './DialogCloseButton.vue'

const drawerVariants = cva(
  'fixed inset-y-0 z-(--z-modal) flex w-full max-w-md flex-col overflow-hidden border-border-strong bg-bg-modal shadow-xl focus:outline-none',
  {
    variants: {
      side: {
        right:
          'right-0 border-s data-[state=closed]:animate-drawer-out-right data-[state=open]:animate-drawer-in-right',
        left: 'left-0 border-e data-[state=closed]:animate-drawer-out-left data-[state=open]:animate-drawer-in-left',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

const props = withDefaults(
  defineProps<{
    open: boolean
    side?: 'right' | 'left'
    title?: string
    /** Accessible name used when neither `title` nor a `header` slot is provided. */
    ariaLabel?: string
    /** Show a visible close button (Esc and overlay dismissal work either way). */
    closable?: boolean
    /** Accessible name of the close button. */
    closeLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { side: 'right', closable: false, closeLabel: 'Close' },
)

const emit = defineEmits<{ close: [] }>()

function onOpenChange(next: boolean) {
  if (!next) emit('close')
}
</script>

<template>
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-(--z-modal) bg-overlay backdrop-blur-sm data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in"
      />
      <DialogContent
        :aria-describedby="undefined"
        :class="cn(drawerVariants({ side }), props.class)"
      >
        <header
          v-if="title || $slots.header"
          class="flex items-center justify-between gap-4 border-b border-border px-6 py-4 text-lg font-bold text-fg"
        >
          <DialogTitle as="h2" class="min-w-0 text-lg font-bold">
            <slot name="header">{{ title }}</slot>
          </DialogTitle>
          <DialogCloseButton v-if="closable" :label="closeLabel" />
        </header>
        <template v-else>
          <VisuallyHidden>
            <DialogTitle>{{ ariaLabel }}</DialogTitle>
          </VisuallyHidden>
          <DialogCloseButton v-if="closable" :label="closeLabel" class="absolute end-3 top-3" />
        </template>

        <div class="flex-1 overflow-y-auto p-6">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t border-border px-6 py-4">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
