<script setup lang="ts">
// Reka Tooltip: portalled, shows on hover and keyboard focus, dismisses on Esc.
// Requires a TooltipProvider ancestor; the app wraps its root in one once.
import type { HTMLAttributes } from 'vue'
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui'
import { cn } from '../lib/cn'

const props = withDefaults(
  defineProps<{
    content: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    /** Milliseconds before opening; omit to inherit the provider's delay. */
    delay?: number
    class?: HTMLAttributes['class']
  }>(),
  { side: 'top', delay: undefined },
)
</script>

<template>
  <TooltipRoot :delay-duration="delay">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        :side="side"
        :side-offset="6"
        :class="
          cn(
            'z-(--z-popover) max-w-xs rounded-md border border-border-strong bg-bg-modal px-2 py-1 text-xs text-fg shadow-md data-[state=closed]:animate-overlay-out data-[state=delayed-open]:animate-overlay-in data-[state=instant-open]:animate-overlay-in',
            props.class,
          )
        "
      >
        {{ content }}
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>
