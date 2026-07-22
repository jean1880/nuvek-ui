<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import { useFocusTrap } from '../composables/useFocusTrap'

// Reentrant body-scroll lock shared across all Modal instances: only the last modal to
// close restores scrolling, so stacked/nested modals don't unlock the page prematurely.
let openModalCount = 0

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    /** Accessible name used when neither `title` nor a `header` slot is provided. */
    ariaLabel?: string
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
  }>(),
  { open: false, closeOnBackdrop: true, closeOnEsc: true },
)

const emit = defineEmits<{ close: [] }>()
const slots = useSlots()

const dialogRef = ref<HTMLElement | null>(null)
const titleId = useId()
const { activate, deactivate } = useFocusTrap()

function onKeydown(e: KeyboardEvent) {
  if (props.closeOnEsc && e.key === 'Escape' && props.open) emit('close')
}

function onBackdrop() {
  if (props.closeOnBackdrop) emit('close')
}

// This instance's hold on the shared scroll lock (kept reentrant-safe).
let hasScrollLock = false
function lockScroll() {
  if (hasScrollLock) return
  hasScrollLock = true
  openModalCount += 1
  document.body.style.overflow = 'hidden'
}
function unlockScroll() {
  if (!hasScrollLock) return
  hasScrollLock = false
  openModalCount = Math.max(0, openModalCount - 1)
  if (openModalCount === 0) document.body.style.overflow = ''
}

// Client-only open/close handling — reused by BOTH the open-transition watcher and the
// already-open-on-mount case. A lazy `watch` alone misses a Modal rendered `:open="true"`
// from first paint; running this in `onMounted` keeps `document` access off the SSR path
// (so `{ immediate: true }`, which would fire during setup on the server, is deliberately
// avoided).
async function handleOpen() {
  lockScroll()
  await nextTick()
  if (dialogRef.value) activate(dialogRef.value)
}
function handleClose() {
  unlockScroll()
  deactivate()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) void handleOpen()
    else handleClose()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (props.open) void handleOpen()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  handleClose()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="nv-modal">
      <div v-if="open" class="nv-modal-overlay" @click.self="onBackdrop">
        <div
          ref="dialogRef"
          class="nv-modal"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-labelledby="title || slots.header ? titleId : undefined"
          :aria-label="!(title || slots.header) ? ariaLabel : undefined"
        >
          <header v-if="title || slots.header" :id="titleId" class="nv-modal__header">
            <slot name="header">{{ title }}</slot>
          </header>
          <div class="nv-modal__body">
            <slot />
          </div>
          <footer v-if="slots.footer" class="nv-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.nv-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: var(--z-modal);
}

.nv-modal {
  background: var(--bg-modal);
  border: 1px solid var(--border-alt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nv-modal__header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text);
}

.nv-modal__body {
  padding: var(--space-6);
  overflow-y: auto;
}

.nv-modal__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.nv-modal-enter-active,
.nv-modal-leave-active {
  transition: opacity 0.2s ease;
}
.nv-modal-enter-active .nv-modal,
.nv-modal-leave-active .nv-modal {
  transition: transform 0.2s ease;
}
.nv-modal-enter-from,
.nv-modal-leave-to {
  opacity: 0;
}
.nv-modal-enter-from .nv-modal,
.nv-modal-leave-to .nv-modal {
  transform: translateY(10px);
}
</style>
