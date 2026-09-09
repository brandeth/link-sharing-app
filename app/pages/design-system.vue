<script setup lang="ts">
import { BaseButton, BaseInput } from '#components'

useHead({ title: 'Design System' })

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

const buttonStateColumns = ['State', 'Primary', 'Secondary']
const buttonStates = [
  ['Default', 'Purple fill, white text', 'White fill, purple border and text'],
  [
    'Hover / active',
    'Fill lightens to purple-300; the label darkens to purple-950 to stay legible on it',
    'Fill becomes purple-100',
  ],
  [
    'Disabled',
    'Muted grey fill, grey label, no hover fill',
    'Muted grey fill, grey label and border, no hover fill',
  ],
  ['Focus', '2px purple outline, 2px offset', '2px purple outline, 2px offset'],
]

const inputSpecimens = [
  // `autocomplete` is not a declared prop — it rides the attribute
  // pass-through onto the inner input, which this specimen documents.
  { label: 'Default', props: { label: 'Email address', placeholder: 'e.g. alex@email.com', type: 'email', autocomplete: 'email' } },
  { label: 'With icon', props: { label: 'Link', icon: 'ph:link-bold', placeholder: 'e.g. https://www.github.com/johnappleseed' } },
  { label: 'Error', props: { label: 'Email address', placeholder: 'e.g. alex@email.com', error: "Can't be empty" } },
  { label: 'Disabled', props: { label: 'Email address', placeholder: 'e.g. alex@email.com', disabled: true } },
]

const inputStateColumns = ['State', 'Frame', 'Contents']
const inputStates = [
  ['Default', '1px border in the border role', 'Placeholder is fg-heading at 50%'],
  ['Focus', 'Border turns brand, plus the glow-brand shadow', 'Unchanged'],
  [
    'Error',
    'Border turns danger; focus glow turns danger too',
    'Label turns danger, message sits inside the field on the right',
  ],
  [
    'Disabled',
    'Fill becomes surface-muted; border unchanged',
    'Label and text keep full strength — the fill carries the state, not opacity',
  ],
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
  { role: 'surface-muted', class: 'bg-surface-muted', maps: 'grey-50' },
  { role: 'canvas', class: 'bg-canvas', maps: 'grey-50' },
  { role: 'brand', class: 'bg-brand', maps: 'purple-600' },
  { role: 'brand-hover', class: 'bg-brand-hover', maps: 'purple-300' },
  { role: 'brand-subtle', class: 'bg-brand-subtle', maps: 'purple-100' },
  { role: 'fg-primary', class: 'bg-fg-primary', maps: 'grey-950' },
  { role: 'fg-heading', class: 'bg-fg-heading', maps: 'grey-900' },
  { role: 'fg-secondary', class: 'bg-fg-secondary', maps: 'grey-500' },
  { role: 'border', class: 'bg-border', maps: 'grey-200' },
  { role: 'danger', class: 'bg-danger', maps: 'red-500' },
]

/* Every preset, in panel order. Preset 3's three weights each get a row;
   the sample text is shared so the size and weight differences are what
   read across the list. */
const typePresets = [
  { util: 'text-preset-1', name: 'Text Preset 1' },
  { util: 'text-preset-3-bold', name: 'Text Preset 3 (Bold)' },
  { util: 'text-preset-3-semibold', name: 'Text Preset 3 (SemiBold)' },
  { util: 'text-preset-3', name: 'Text Preset 3 (Regular)' },
  { util: 'text-preset-4', name: 'Text Preset 4' },
]
const typeSample = 'Share several links, one short URL'
const weightNames: Record<string, string> = { '400': 'Regular', '600': 'SemiBold', '700': 'Bold' }

/* Read the real values off :root rather than restating them here, so the
   labels cannot drift from main.css. Both primitives and the type presets
   live in `@theme static`, which emits every custom property — including
   each preset's `--line-height` / `--font-weight` modifier — whether or
   not a generated utility references it. The semantic roles are the
   exception: `@theme inline` resolves them away, so those are documented
   by hand above. */
const hexes = ref<Record<string, string>>({})
const typeSpecs = ref<Record<string, string>>({})
onMounted(() => {
  const styles = getComputedStyle(document.documentElement)
  hexes.value = Object.fromEntries(
    primitives.map((token) => [token, styles.getPropertyValue(`--color-${token}`).trim()]),
  )
  typeSpecs.value = Object.fromEntries(
    typePresets.map(({ util }) => {
      const read = (suffix = '') => styles.getPropertyValue(`--${util}${suffix}`).trim()
      const weight = read('--font-weight')
      return [util, `${read()} · ${weightNames[weight] ?? weight} · ${read('--line-height')} line-height`]
    }),
  )
})
</script>

<template>
  <main class="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-1 text-fg-heading">Design System</h1>
      <p class="max-w-2xl text-preset-3 text-fg-secondary">
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
          :slot-text="specimen.slot"
        />
      </div>

      <DsStateTable :columns="buttonStateColumns" :rows="buttonStates" />
    </DsSection>

    <DsSection
      title="Input"
      description="One 56px field that matches the button's height, with an optional label, leading icon and inline error. These specimens are live — click into one to see the focus glow, or type to see the filled state."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <DsSpecimen
          v-for="specimen in inputSpecimens"
          :key="specimen.label"
          :component="BaseInput"
          name="BaseInput"
          :label="specimen.label"
          :component-props="specimen.props"
        />
      </div>

      <DsStateTable :columns="inputStateColumns" :rows="inputStates" />
    </DsSection>

    <DsSection
      title="Type presets"
      description="One utility per row of the Figma type panel. Each carries font size, line height and weight together, so a preset needs no companion font-* class. Values are read back from :root so they cannot drift from main.css."
    >
      <ul class="flex flex-col gap-3">
        <li
          v-for="preset in typePresets"
          :key="preset.util"
          class="flex flex-col gap-2 rounded-lg border border-grey-100 p-4"
        >
          <p :class="preset.util" class="text-fg-primary">{{ typeSample }}</p>
          <span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <code class="text-sm font-semibold text-fg-primary">{{ preset.util }}</code>
            <code class="text-xs text-fg-secondary">{{ typeSpecs[preset.util] || '—' }}</code>
          </span>
        </li>
      </ul>
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
