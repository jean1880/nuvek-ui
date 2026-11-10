<script setup lang="ts">
// Styled menu button. Reka UI owns the behaviour (roving focus, typeahead, arrow keys, Esc,
// focus return, collision handling); this maps props onto it and styles the surface.
// `trigger` is the element that opens the menu (it keeps its own markup and name); the
// default slot holds MenuItem / MenuRadioGroup / MenuCheckboxItem / MenuSeparator / MenuLabel.
import type { HTMLAttributes } from 'vue'
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { cn } from '../lib/cn'

const props = withDefaults(
  defineProps<{
    open?: boolean
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
    /** Class for the popup surface (the root renders no element of its own). */
    class?: HTMLAttributes['class']
  }>(),
  // `open` must default to undefined: Vue would cast an absent boolean to false and the menu
  // would be stuck controlled-closed instead of managing its own state.
  { open: undefined, side: 'bottom', align: 'start' },
)

defineEmits<{ 'update:open': [open: boolean] }>()
</script>

<template>
  <DropdownMenuRoot :open="open" @update:open="$emit('update:open', $event)">
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :side="side"
        :align="align"
        :side-offset="6"
        :class="
          cn(
            'z-(--z-popover) min-w-44 max-w-xs overflow-hidden rounded-md border border-border-strong bg-bg-modal p-1 text-fg shadow-xl',
            props.class,
          )
        "
      >
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
