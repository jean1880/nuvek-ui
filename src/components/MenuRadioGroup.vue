<script setup lang="ts">
// A group of mutually exclusive MenuRadioItem rows; v-model is the chosen item's `value`.
import { DropdownMenuRadioGroup } from 'reka-ui'

defineProps<{ modelValue?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <DropdownMenuRadioGroup :model-value="modelValue" @update:model-value="$emit('update:modelValue', String($event ?? ''))">
    <slot />
  </DropdownMenuRadioGroup>
</template>
