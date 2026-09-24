<script setup lang="ts">
import { ref } from 'vue'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Modal,
  Panel,
  ToastStack,
  useToasts,
} from '../src'

const colors = ['success', 'error', 'warning', 'running', 'idle', 'neutral'] as const
const chipVariants = ['soft', 'filled', 'outlined'] as const

const modalOpen = ref(false)
const { toasts, showToast, dismiss } = useToasts()
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-8 p-8">
    <h1 class="text-2xl font-bold">nuvek-ui playground</h1>

    <Panel title="Button">
      <div class="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
        <Button as="a" href="#">As link</Button>
        <Button class="px-8">class override</Button>
      </div>
    </Panel>

    <Panel title="Chip">
      <div class="flex flex-col gap-3">
        <div v-for="v in chipVariants" :key="v" class="flex flex-wrap items-center gap-2">
          <Chip v-for="c in colors" :key="c" :color="c" :variant="v">{{ c }}</Chip>
          <Chip :variant="v" size="sm">sm</Chip>
        </div>
      </div>
    </Panel>

    <div class="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          Elevated card
          <template #actions><Chip color="success" size="sm">live</Chip></template>
        </CardHeader>
        <CardBody>Body content.</CardBody>
        <CardFooter><Button variant="ghost">Action</Button></CardFooter>
      </Card>
      <Card variant="outlined" hoverable>
        <CardBody>Outlined + hoverable.</CardBody>
      </Card>
    </div>

    <Panel title="Overlays">
      <div class="flex flex-wrap gap-3">
        <Button @click="modalOpen = true">Open modal</Button>
        <Button variant="ghost" @click="showToast('Saved')">Success toast</Button>
        <Button variant="ghost" @click="showToast('Failed', 'error')">Error toast</Button>
        <Button variant="ghost" @click="showToast('Heads up', 'warning')">Warning toast</Button>
      </div>
    </Panel>

    <Modal :open="modalOpen" title="Confirm action" @close="modalOpen = false">
      Are you sure?
      <template #footer>
        <Button variant="ghost" @click="modalOpen = false">Cancel</Button>
        <Button variant="danger" @click="modalOpen = false">Delete</Button>
      </template>
    </Modal>
    <ToastStack :toasts="toasts" @dismiss="dismiss" />
  </main>
</template>
