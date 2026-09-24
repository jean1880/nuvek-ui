import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge ships knowing Tailwind's DEFAULT scales only. A theme key it has never
// heard of falls through to the colour group (colour validators accept any name), so
// `text-2xs` would be read as a text COLOUR and silently drop `text-fg` — or vice versa.
// Every non-colour key theme.css adds to a colour-sharing namespace must be listed here;
// the cn tests pin each one.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs', 'fluid-base', 'fluid-lg', 'fluid-xl', 'fluid-2xl'],
      shadow: ['card', 'glow'],
    },
  },
})

/**
 * Compose class lists and resolve Tailwind conflicts — the LAST conflicting utility wins.
 * Components pass their own classes first and the consumer's `class` last, so
 * `<Button class="px-2">` replaces the button's `px-4` instead of fighting it.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
