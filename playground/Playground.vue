<script setup lang="ts">
import { ref } from 'vue'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Combobox,
  Drawer,
  Modal,
  Panel,
  Select,
  Avatar,
  ProgressBar,
  SearchField,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  ToastStack,
  Tooltip,
  TooltipProvider,
  useToasts,
} from '../src'

const colors = ['success', 'error', 'warning', 'running', 'idle', 'neutral'] as const
const chipVariants = ['soft', 'filled', 'outlined'] as const

const modalOpen = ref(false)
const drawerSide = ref<'right' | 'left' | null>(null)
const tab = ref('one')
const text = ref('')
const search = ref('query')
const sides = ['top', 'right', 'bottom', 'left'] as const
const intents = ['primary', 'success', 'warning', 'error'] as const
const sizes = ['sm', 'md', 'lg'] as const
const { toasts, showToast, dismiss } = useToasts()

const fruit = ref<string | number>('')
const fruitOptions = [
  { value: 'apple', label: 'Apple', group: 'Pome' },
  { value: 'pear', label: 'Pear', group: 'Pome' },
  { value: 'plum', label: 'Plum', group: 'Stone' },
  { value: 'cherry', label: 'Cherry (sold out)', group: 'Stone', disabled: true },
  { value: 'fig', label: 'Fig' },
]
const one = ref<string | number>('')
const tags = ref<(string | number)[]>(['red'])
const tagOptions = ref([
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
])
function addTag(text: string) {
  const value = text.toLowerCase()
  tagOptions.value = [...tagOptions.value, { value, label: text }]
  tags.value = [...tags.value, value]
}
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

    <TooltipProvider>
      <Panel title="Tabs">
        <Tabs v-model="tab">
          <TabsList>
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
            <TabsTrigger value="three" disabled>Disabled</TabsTrigger>
          </TabsList>
          <TabsContent value="one">First panel ({{ tab }}).</TabsContent>
          <TabsContent value="two">Second panel.</TabsContent>
        </Tabs>
      </Panel>

      <Panel title="Tooltip">
        <div class="flex flex-wrap gap-3">
          <Tooltip v-for="s in sides" :key="s" :side="s" content="Tooltip text">
            <Button variant="ghost">{{ s }}</Button>
          </Tooltip>
          <Tooltip content="No delay" :delay="0"><Button variant="ghost">delay 0</Button></Tooltip>
        </div>
      </Panel>
    </TooltipProvider>

    <Panel title="Drawer">
      <div class="flex flex-wrap gap-3">
        <Button @click="drawerSide = 'right'">Right drawer</Button>
        <Button variant="ghost" @click="drawerSide = 'left'">Left drawer</Button>
      </div>
    </Panel>
    <Drawer :open="drawerSide !== null" :side="drawerSide ?? 'right'" title="Drawer" @close="drawerSide = null">
      Drawer body.
      <template #footer><Button variant="ghost" @click="drawerSide = null">Close</Button></template>
    </Drawer>

    <Panel title="Fields">
      <div class="grid gap-4 sm:grid-cols-2">
        <TextField v-model="text" label="Labelled" placeholder="Type here" />
        <TextField v-model="text" placeholder="Placeholder only (aria-label)" />
        <TextField v-model="text" label="Password" type="password" />
        <TextField v-model="text" label="Disabled" disabled />
        <SearchField v-model="search" label="Search" placeholder="Search…" />
        <SearchField v-model="search" placeholder="Search without label" />
        <SearchField v-model="search" label="Disabled search" disabled />
        <SearchField v-model="text" placeholder="Empty (no clear button)" />
      </div>
    </Panel>

    <Panel title="Select and Combobox">
      <div class="grid gap-4 sm:grid-cols-2">
        <Select v-model="fruit" label="Fruit" placeholder="Pick a fruit" help="Grouped, one disabled" :options="fruitOptions" />
        <Select v-model="fruit" label="Required" required error="Choose a fruit" :options="fruitOptions" />
        <Select v-model="fruit" label="Small" size="sm" :options="fruitOptions" />
        <Select v-model="fruit" label="Disabled" disabled :options="fruitOptions" />
        <Combobox v-model="one" label="Combobox" placeholder="Type to filter" :options="fruitOptions" />
        <Combobox v-model="tags" multiple allow-create label="Tags" placeholder="Add tags" :options="tagOptions" @create="addTag" />
        <Combobox v-model="one" label="Loading" loading :options="[]" />
        <Combobox v-model="one" label="Error" error="Required" :options="fruitOptions" />
      </div>
    </Panel>

    <Panel title="Skeleton">
      <div class="flex items-center gap-3">
        <Skeleton class="size-12 rounded-full" />
        <div class="flex flex-col gap-2">
          <Skeleton class="h-4 w-48" />
          <Skeleton class="h-4 w-32" />
        </div>
      </div>
    </Panel>

    <Panel title="Avatar">
      <div class="flex flex-wrap items-center gap-3">
        <Avatar v-for="s in sizes" :key="s" :size="s" name="Ada Lovelace" />
        <Avatar name="plato" />
        <Avatar name="Broken Image" src="https://example.invalid/missing.png" />
      </div>
    </Panel>

    <Panel title="ProgressBar">
      <div class="flex flex-col gap-3">
        <ProgressBar v-for="i in intents" :key="i" :intent="i" :value="60" :max="100" :label="i" />
        <ProgressBar :value="0" :max="10" label="Empty" />
        <ProgressBar :value="25" :max="10" label="Clamped to max" />
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
