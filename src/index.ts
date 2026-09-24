// nuvek-ui public entry — Reka UI-based Vue components styled with Tailwind utilities.
// Styling is NOT bundled: the consumer's Tailwind build generates it from these components'
// class strings. Consuming apps wire it once in their stylesheet:
//   @import "tailwindcss";
//   @import "@nuvek/ui/theme.css";
// then `import { Button, Chip, Card, ... } from '@nuvek/ui'`.

export const version = '1.0.0'

// Components
export { default as Button } from './components/Button.vue'
export { default as Chip } from './components/Chip.vue'
export { default as Card } from './components/Card.vue'
export { default as CardHeader } from './components/CardHeader.vue'
export { default as CardBody } from './components/CardBody.vue'
export { default as CardFooter } from './components/CardFooter.vue'
export { default as Panel } from './components/Panel.vue'
export { default as Modal } from './components/Modal.vue'
export { default as ToastStack } from './components/ToastStack.vue'

// Composables
export { useToasts } from './composables/useToasts'
export type { Toast, ToastType } from './composables/useToasts'
export { useTheme } from './composables/useTheme'
export type { Theme } from './composables/useTheme'

// Utilities
export { cn } from './lib/cn'
