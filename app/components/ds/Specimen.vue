<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  /** The component to render. */
  component: Component
  /** Tag name for the snippet. Derived from the component when omitted. */
  name?: string
  /** Props to render with — and to print in the snippet. */
  componentProps?: Record<string, unknown>
  /** Prop defaults, so the snippet omits them. */
  defaults?: Record<string, unknown>
  /** Default-slot text. */
  slotText?: string
  /** Caption above the preview. */
  label?: string
}>()

const componentName = computed(
  () => props.name ?? (props.component as { __name?: string }).__name ?? 'Component',
)

const snippet = computed(() =>
  toSnippet({
    name: componentName.value,
    props: props.componentProps,
    defaults: props.defaults,
    slot: props.slotText,
  }),
)

const status = ref<'idle' | 'copied' | 'failed'>('idle')
let resetTimer: ReturnType<typeof setTimeout> | undefined

const copyLabel = computed(
  () => ({ idle: 'Copy', copied: 'Copied', failed: 'Failed' })[status.value],
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
        <span aria-live="polite">{{ copyLabel }}</span>
      </button>
    </div>
  </figure>
</template>
