<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Visible label, rendered above the field. */
    label?: string
    /** Iconify name for the leading icon, e.g. `ph:link-bold`. */
    icon?: string
    /** Native input type. */
    type?: 'text' | 'email' | 'password' | 'url'
    placeholder?: string
    /** Validation message. Its presence *is* the error state. */
    error?: string
    disabled?: boolean
  }>(),
  {
    type: 'text',
    disabled: false,
  },
)

const value = defineModel<string>({ default: '' })

/* Generated per instance so a caller never has to invent an id to pair
   the label with its control, and so two of the same field on one page
   cannot collide. */
const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <label
      v-if="label"
      :for="inputId"
      class="text-xs"
      :class="error ? 'text-danger' : 'text-fg-heading'"
    >
      {{ label }}
    </label>

    <!-- The border, padding and focus ring live on this wrapper rather than
         on the input, so the icon sits inside the box and the whole field
         lights up together. `focus-within` is what forwards the inner
         input's focus out to the border. -->
    <div
      class="flex h-14 w-full items-center gap-4 rounded-lg border bg-surface px-4 transition-shadow"
      :class="[
        error ? 'border-danger' : 'border-border focus-within:border-brand focus-within:shadow-focus',
        disabled && 'cursor-not-allowed opacity-50',
      ]"
    >
      <Icon
        v-if="icon"
        :name="icon"
        class="size-4 shrink-0"
        :class="error ? 'text-danger' : 'text-fg-secondary'"
      />

      <!-- Chrome is stripped here because the wrapper owns it: no border,
           no ring, and a transparent fill so the wrapper's background and
           rounded corners are the ones you see. -->
      <input
        :id="inputId"
        v-model="value"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="error ? errorId : undefined"
        class="min-w-0 flex-1 border-none bg-transparent text-base text-fg-heading outline-none placeholder:text-fg-heading/50 disabled:cursor-not-allowed"
      >

      <!-- The message sits inside the box, right-aligned, per the design.
           `shrink-0` keeps it whole and lets the input give up width. -->
      <span
        v-if="error"
        :id="errorId"
        class="shrink-0 text-xs text-danger"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>
