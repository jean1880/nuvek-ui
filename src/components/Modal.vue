<script setup lang="ts">
import { onBeforeUnmount, onMounted, useSlots, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
  }>(),
  { open: false, closeOnBackdrop: true, closeOnEsc: true },
)

const emit = defineEmits<{ close: [] }>()
const slots = useSlots()

function onKeydown(e: KeyboardEvent) {
  if (props.closeOnEsc && e.key === 'Escape' && props.open) emit('close')
}

function onBackdrop() {
  if (props.closeOnBackdrop) emit('close')
}

// Lock body scroll while open.
watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="nv-modal">
      <div v-if="open" class="nv-modal-overlay" @click.self="onBackdrop">
        <div class="nv-modal" role="dialog" aria-modal="true">
          <header v-if="title || slots.header" class="nv-modal__header">
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
  z-index: 2000;
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
