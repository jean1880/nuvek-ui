// nuvek-ui public entry — shared design tokens, base styles, and Vue components.
// Consuming apps: `import '@nuvek/ui/style.css'` for tokens+base, and
// `import { Button, Badge, ... } from '@nuvek/ui'` for components.
import './style.css'

export const version = '0.1.1'

// Components
export { default as Button } from './components/Button.vue'
export { default as Badge } from './components/Badge.vue'
export { default as Card } from './components/Card.vue'
export { default as Panel } from './components/Panel.vue'
export { default as Modal } from './components/Modal.vue'
export { default as ToastStack } from './components/ToastStack.vue'

// Composables
export { useToasts } from './composables/useToasts'
export type { Toast, ToastType } from './composables/useToasts'
export { useTheme } from './composables/useTheme'
export type { Theme } from './composables/useTheme'
export { useFocusTrap } from './composables/useFocusTrap'
