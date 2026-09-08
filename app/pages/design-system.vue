<script setup lang="ts">
import { BaseButton } from '#components'

useHead({ title: 'Design System' })

/** Mirrors `withDefaults` in BaseButton, so snippets omit default props. */
const buttonDefaults = { variant: 'primary', type: 'button', disabled: false }

const buttonSpecimens = [
  { label: 'Primary', props: {}, slot: 'Save' },
  { label: 'Primary · disabled', props: { disabled: true }, slot: 'Save' },
  { label: 'Secondary', props: { variant: 'secondary' }, slot: '+ Add new link' },
  {
    label: 'Secondary · disabled',
    props: { variant: 'secondary', disabled: true },
    slot: '+ Add new link',
  },
  { label: 'Submit', props: { type: 'submit' }, slot: 'Save' },
]

const buttonStates = [
  { state: 'Default', primary: 'Purple fill, white text', secondary: 'White fill, purple border and text' },
  { state: 'Hover / active', primary: 'Fill lightens to purple-300', secondary: 'Fill becomes purple-100' },
  { state: 'Disabled', primary: '25% opacity, no hover fill', secondary: '25% opacity, no hover fill' },
  { state: 'Focus', primary: '2px purple outline, 2px offset', secondary: '2px purple outline, 2px offset' },
]

const primitives = [
  ['grey-950', 'grey-900', 'grey-500', 'grey-200', 'grey-100', 'grey-50'],
  ['purple-950', 'purple-600', 'purple-300', 'purple-100'],
  ['blue-800', 'blue-500'],
  ['red-550', 'red-500'],
  ['pink-900', 'pink-400', 'orange-600', 'orange-500'],
].flat()

/* `@theme inline` resolves aliases straight to the primitive var, so these
   emit no custom property of their own — the swatch has to use the utility
   class, and the mapping is documented rather than read back. */
const semanticRoles = [
  { role: 'surface', class: 'bg-surface', maps: 'white' },
  { role: 'brand', class: 'bg-brand', maps: 'purple-600' },
  { role: 'brand-hover', class: 'bg-brand-hover', maps: 'purple-300' },
  { role: 'brand-subtle', class: 'bg-brand-subtle', maps: 'purple-100' },
  { role: 'fg-primary', class: 'bg-fg-primary', maps: 'grey-950' },
  { role: 'fg-heading', class: 'bg-fg-heading', maps: 'grey-900' },
  { role: 'fg-secondary', class: 'bg-fg-secondary', maps: 'grey-500' },
]

/* Read the real values off :root rather than restating them here, so the
   labels cannot drift from main.css. Primitives live in a plain `@theme`
   block, so unlike the semantic roles they do emit custom properties. */
const hexes = ref<Record<string, string>>({})
onMounted(() => {
  const styles = getComputedStyle(document.documentElement)
  hexes.value = Object.fromEntries(
    primitives.map((token) => [token, styles.getPropertyValue(`--color-${token}`).trim()]),
  )
})
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
    <header class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold text-fg-heading">Design System</h1>
      <p class="max-w-2xl text-fg-secondary">
        Live components and colour tokens for the link sharing app. Every snippet is
        generated from the same props the specimen above it renders with, so the two
        cannot fall out of sync.
      </p>
    </header>

    <DsSection
      title="Button"
      description="One size, two variants. Hover and active states are real here — hover a specimen to see them, since a static screenshot of an interactive state would not match the snippet."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <DsSpecimen
          v-for="specimen in buttonSpecimens"
          :key="specimen.label"
          :component="BaseButton"
          name="BaseButton"
          :label="specimen.label"
          :component-props="specimen.props"
          :defaults="buttonDefaults"
          :slot-text="specimen.slot"
        />
      </div>

      <div class="overflow-x-auto rounded-lg border border-grey-100">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-grey-100 bg-grey-50 text-fg-secondary">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">State</th>
              <th scope="col" class="px-4 py-3 font-semibold">Primary</th>
              <th scope="col" class="px-4 py-3 font-semibold">Secondary</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in buttonStates" :key="row.state" class="border-b border-grey-100 last:border-0">
              <th scope="row" class="px-4 py-3 font-semibold text-fg-heading">{{ row.state }}</th>
              <td class="px-4 py-3 text-fg-secondary">{{ row.primary }}</td>
              <td class="px-4 py-3 text-fg-secondary">{{ row.secondary }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DsSection>

    <DsSection
      title="Colour tokens"
      description="Tier one is the raw palette, named by scale. Tier two gives those primitives a role, and components use only the roles."
    >
      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold tracking-wide text-fg-secondary uppercase">Primitives</h3>
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <li
            v-for="token in primitives"
            :key="token"
            class="flex items-center gap-3 rounded-lg border border-grey-100 p-3"
          >
            <span
              class="size-10 shrink-0 rounded-md border border-grey-100"
              :style="{ backgroundColor: `var(--color-${token})` }"
            />
            <span class="flex min-w-0 flex-col">
              <code class="truncate text-sm font-semibold text-fg-primary">{{ token }}</code>
              <code class="text-xs text-fg-secondary uppercase">{{ hexes[token] || '—' }}</code>
            </span>
          </li>
        </ul>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="text-sm font-semibold tracking-wide text-fg-secondary uppercase">Semantic roles</h3>
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <li
            v-for="role in semanticRoles"
            :key="role.role"
            class="flex items-center gap-3 rounded-lg border border-grey-100 p-3"
          >
            <span class="size-10 shrink-0 rounded-md border border-grey-100" :class="role.class" />
            <span class="flex min-w-0 flex-col">
              <code class="truncate text-sm font-semibold text-fg-primary">{{ role.role }}</code>
              <code class="text-xs text-fg-secondary">→ {{ role.maps }}</code>
            </span>
          </li>
        </ul>
      </div>
    </DsSection>
  </main>
</template>
