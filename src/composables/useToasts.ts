import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  msg: string
  type: ToastType
  /** How long the toast stays up, in ms. ToastStack's timer owns this (it pauses on hover). */
  duration: number
}

/**
 * Shared transient-notification state. Pair with `ToastStack`, wiring BOTH directions —
 * the stack owns each toast's lifetime and reports when it ends:
 *
 *   const { toasts, showToast, dismiss } = useToasts()
 *   <ToastStack :toasts="toasts" @dismiss="dismiss" />
 */
export function useToasts(durationMs = 4000) {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function showToast(msg: string, type: ToastType = 'success') {
    toasts.value.push({ id: nextId++, msg, type, duration: durationMs })
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, dismiss }
}
