// nuvek-ui public entry — Reka UI-based Vue components styled with Tailwind utilities.
// Styling is NOT bundled: the consumer's Tailwind build generates it from these components'
// class strings. Consuming apps wire it once in their stylesheet:
//   @import "tailwindcss";
//   @import "@nuvek/ui/theme.css";
// then `import { Button, Chip, Card, ... } from '@nuvek/ui'`.

export const version = '1.3.0'

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
export { default as Tabs } from './components/Tabs.vue'
export { default as TabsList } from './components/TabsList.vue'
export { default as TabsTrigger } from './components/TabsTrigger.vue'
export { default as TabsContent } from './components/TabsContent.vue'
export { default as Tooltip } from './components/Tooltip.vue'
// Tooltip requires one TooltipProvider ancestor: wrap the app root once, <TooltipProvider><App /></TooltipProvider>.
export { TooltipProvider } from 'reka-ui'
export { default as Drawer } from './components/Drawer.vue'
export { default as TextField } from './components/TextField.vue'
export { default as SearchField } from './components/SearchField.vue'
export { default as Skeleton } from './components/Skeleton.vue'
export { default as DropdownMenu } from './components/DropdownMenu.vue'
export { default as MenuItem } from './components/MenuItem.vue'
export { default as MenuRadioGroup } from './components/MenuRadioGroup.vue'
export { default as MenuRadioItem } from './components/MenuRadioItem.vue'
export { default as MenuCheckboxItem } from './components/MenuCheckboxItem.vue'
export { default as MenuSeparator } from './components/MenuSeparator.vue'
export { default as MenuLabel } from './components/MenuLabel.vue'
export { default as Avatar } from './components/Avatar.vue'
export { default as ProgressBar } from './components/ProgressBar.vue'
export { default as Select } from './components/Select.vue'
export { default as Combobox } from './components/Combobox.vue'
export type { SelectOption, FieldSize } from './lib/field'

// Composables
export { useToasts, defaultToastDurations } from './composables/useToasts'
export type { Toast, ToastType } from './composables/useToasts'
export { useTheme } from './composables/useTheme'
export type { Theme } from './composables/useTheme'

// Utilities
export { cn } from './lib/cn'
