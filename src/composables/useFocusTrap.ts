import { onBeforeUnmount } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(',')

/**
 * Trap keyboard focus within a container (dialogs, popovers). On [`activate`], records the
 * currently-focused element, moves focus into the container, and cycles Tab/Shift-Tab within
 * it; on [`deactivate`], restores focus to the original element. Deactivates automatically on
 * unmount. All DOM access happens inside the returned functions, so it is SSR-safe until used.
 */
export function useFocusTrap() {
  let container: HTMLElement | null = null
  let previouslyFocused: HTMLElement | null = null

  function focusable(): HTMLElement[] {
    if (!container) return []
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    )
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !container) return
    const items = focusable()
    if (items.length === 0) {
      e.preventDefault()
      container.focus()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  /** Begin trapping focus inside `el`, moving focus to its first focusable (or `el` itself). */
  function activate(el: HTMLElement) {
    container = el
    previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', onKeydown, true)
    const items = focusable()
    ;(items[0] ?? container).focus()
  }

  /** Stop trapping and restore focus to the element active before [`activate`]. */
  function deactivate() {
    if (!container) return
    document.removeEventListener('keydown', onKeydown, true)
    container = null
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus()
    }
    previouslyFocused = null
  }

  onBeforeUnmount(deactivate)

  return { activate, deactivate }
}
