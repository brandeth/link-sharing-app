<script setup lang="ts">
defineProps<{
  /** 1-based position in the list. Links renumber when one is removed,
      so this is passed in rather than stored on the link. */
  number: number
  /** Validation message for the URL, set when a save fails. */
  error?: string
}>()

const emit = defineEmits<{ remove: [] }>()

const platform = defineModel<PlatformId>('platform', { required: true })
const url = defineModel<string>('url', { required: true })

const platformOptions = PLATFORMS.map(({ id, label, icon }) => ({ value: id, label, icon }))
</script>

<template>
  <!-- `canvas` on the white content card, the same well treatment the
       empty state uses, 16px between header and fields. Padded 16px,
       tighter than the export's 24px. -->
  <div class="flex flex-col gap-4 rounded-xl bg-canvas p-4">
    <div class="flex items-center justify-between gap-4">
      <h2 class="flex items-center gap-2 text-preset-3-bold text-fg-secondary">
        <!-- The drag handle: two 12px rules, 4px apart. Drawn only for
             now — reordering comes later — so it is decorative. -->
        <span class="flex w-3 flex-col gap-1" aria-hidden="true">
          <span class="h-px bg-fg-secondary" />
          <span class="h-px bg-fg-secondary" />
        </span>
        Link #{{ number }}
      </h2>

      <!-- Every card has a "Remove", so the visible word alone would not
           say which link it removes. -->
      <button
        type="button"
        class="rounded text-preset-3 text-fg-secondary transition-colors outline-none hover:text-brand focus-visible:text-brand focus-visible:underline"
        :aria-label="`Remove link #${number}`"
        @click="emit('remove')"
      >
        Remove
      </button>
    </div>

    <BaseSelect v-model="platform" label="Platform" :options="platformOptions" />

    <BaseInput
      v-model="url"
      label="Link"
      type="url"
      icon="ph:link-bold"
      placeholder="e.g. https://www.github.com/johnappleseed"
      autocomplete="url"
      :error="error"
    />
  </div>
</template>
