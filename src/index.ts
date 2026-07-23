// nuvek-ui public entry — shared design tokens, base styles, and Vue components.
// Consuming apps: `import '@nuvek/ui/style.css'` for tokens+base, and
// `import { Button, Chip, Card, ... } from '@nuvek/ui'` for components.
import './style.css'

export const version = '0.3.0'

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
export { useFocusTrap } from './composables/useFocusTrap'
