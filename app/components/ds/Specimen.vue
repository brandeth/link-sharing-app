<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  /** The component to render. */
  component: Component
  /** Tag name for the snippet. Vue only keeps `__name` for devtools, so
   *  it is not reliable in a production build — the tag is passed in. */
  name: string
  /** Props to render with — and to print in the snippet. */
  componentProps?: Record<string, unknown>
  /** Default-slot text. */
  slotText?: string
  /** Caption above the preview. */
  label?: string
}>()

/**
 * Reads each prop's default off the component itself.
 *
 * `withDefaults` compiles down to a runtime `props` object that carries
 * them, so the page does not have to restate them by hand — a mirrored
 * copy is the one thing on this page that could drift from the source.
 *
 * A default declared as a factory is skipped: calling it to compare
 * would be a guess about whether it is a factory or a genuine function
 * value, and no prop here uses one.
 */
function propDefaults(component: Component): Record<string, unknown> {
  const declared = (component as { props?: unknown }).props
  if (!declared || typeof declared !== 'object' || Array.isArray(declared)) return {}

  return Object.fromEntries(
    Object.entries(declared as Record<string, { default?: unknown } | null>)
      .filter(([, option]) => option && typeof option === 'object' && 'default' in option)
      .map(([key, option]) => [key, option!.default])
      .filter(([, value]) => typeof value !== 'function'),
  )
}

const snippet = computed(() =>
  toSnippet({
    name: props.name,
    props: props.componentProps,
    defaults: propDefaults(props.component),
    slot: props.slotText,
  }),
)

const status = ref<'idle' | 'copied' | 'failed'>('idle')
let resetTimer: ReturnType<typeof setTimeout> | undefined

const copyLabel = computed(
  () => ({ idle: 'Copy', copied: 'Copied', failed: 'Failed' })[status.value],
)

/* Announced from a region outside the button. Putting `aria-live` on the
   label itself makes the same text both the live region and the button's
   accessible name, which some screen readers then read twice. */
const liveMessage = computed(
  () => ({ idle: '', copied: 'Snippet copied', failed: 'Copy failed' })[status.value],
)

/**
 * Deprecated, but it still works where the async Clipboard API is refused —
 * a denied `clipboard-write` permission, or an insecure origin.
 */
function copyByExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
  document.body.append(textarea)
  textarea.select()

  let copied = false
  try {
    copied = document.execCommand('copy')
  }
  catch {
    copied = false
  }
  textarea.remove()
  return copied
}

async function copy() {
  let copied = false
  try {
    await navigator.clipboard.writeText(snippet.value)
    copied = true
  }
  catch {
    copied = copyByExecCommand(snippet.value)
  }

  // Surface the outcome either way — a copy button that silently does
  // nothing is worse than one that admits it failed.
  status.value = copied ? 'copied' : 'failed'
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => (status.value = 'idle'), 2000)
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <figure class="flex flex-col overflow-hidden rounded-lg border border-grey-100">
    <figcaption
      v-if="label"
      class="border-b border-grey-100 px-4 py-2 text-sm font-semibold text-fg-secondary"
    >
      {{ label }}
    </figcaption>

    <div class="flex min-h-32 items-center justify-center bg-surface p-8">
      <component :is="component" v-bind="componentProps">{{ slotText }}</component>
    </div>

    <div class="flex items-start gap-3 border-t border-grey-100 bg-grey-50 p-3">
      <pre class="flex-1 overflow-x-auto py-1 text-sm leading-6 text-fg-primary"><code>{{ snippet }}</code></pre>
      <!-- Deliberately not a BaseButton: the design has a single 56px button
           size, and this is page chrome rather than app UI. Inventing a size
           variant to fit here would put something in the component that the
           design system does not actually specify. -->
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-md border bg-surface px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        :class="status === 'failed' ? 'border-red-500 text-red-500' : 'border-grey-200 text-fg-secondary hover:border-brand hover:text-brand'"
        @click="copy"
      >
        {{ copyLabel }}
      </button>

      <span class="sr-only" role="status" aria-live="polite">{{ liveMessage }}</span>
    </div>
  </figure>
</template>
