import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  msg: string
  type: ToastType
  /**
   * How long the toast stays up, in ms; `Infinity` keeps it until dismissed.
   * ToastStack's timer owns this (it pauses on hover).
   */
  duration: number
}

/** Per-type lifetimes in ms. Errors stay until dismissed; the rest last long enough to read. */
export const defaultToastDurations: Record<ToastType, number> = {
  success: 8000,
  info: 8000,
  warning: 8000,
  error: Number.POSITIVE_INFINITY,
}

/**
 * Shared transient-notification state. Pair with `ToastStack`, wiring BOTH directions —
 * the stack owns each toast's lifetime and reports when it ends:
 *
 *   const { toasts, showToast, dismiss } = useToasts()
 *   <ToastStack :toasts="toasts" @dismiss="dismiss" />
 *
 * `durations` is either one number applied to every type, or a partial per-type map
 * layered over the defaults (errors persistent, everything else 8 s).
 */
export function useToasts(durations?: number | Partial<Record<ToastType, number>>) {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  const resolved: Record<ToastType, number> =
    typeof durations === 'number'
      ? { success: durations, info: durations, warning: durations, error: durations }
      : { ...defaultToastDurations, ...durations }

  function showToast(msg: string, type: ToastType = 'success') {
    toasts.value.push({ id: nextId++, msg, type, duration: resolved[type] })
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, dismiss }
}
