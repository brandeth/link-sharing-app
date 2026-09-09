<script setup lang="ts">
const props = withDefaults(
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

/* The root element is a wrapper, not the control, so the default
   fallthrough would drop `name`, `autocomplete`, `required` and friends
   onto a div where they do nothing. Attributes are split by hand
   instead: `class` and `style` describe the field's box and stay on the
   root, everything else is a native input attribute and is forwarded to
   the input. */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

/* Generated per instance so a caller never has to invent an id to pair
   the label with its control, and so two of the same field on one page
   cannot collide. */
const inputId = useId()
const errorId = `${inputId}-error`

/* Both states keep a focus glow. Dropping it while errored would leave
   a keyboard user with no way to tell which field they are in, exactly
   when they most need to find it.

   Disabled is carried by the frame's fill instead — see the note on
   `surface-muted` in main.css for why it is not an opacity. */
const frameClasses = computed(() =>
  props.error
    ? 'border-danger focus-within:glow-danger'
    : 'border-border focus-within:border-brand focus-within:glow-brand',
)
</script>

<template>
  <div
    class="flex w-full flex-col gap-1"
    :class="$attrs.class"
    :style="$attrs.style"
  >
    <label
      v-if="label"
      :for="inputId"
      class="text-preset-4"
      :class="error ? 'text-danger' : 'text-fg-heading'"
    >
      {{ label }}
    </label>

    <!-- The border, padding and focus ring live on this frame rather than
         on the input, so the icon sits inside the box and the whole field
         lights up together. `focus-within` is what forwards the inner
         input's focus out to the border.

         Both the border and the glow are transitioned; animating only the
         shadow would leave the border colour snapping. -->
    <div
      class="flex h-14 items-center gap-4 rounded-lg border px-4 transition-[border-color,box-shadow]"
      :class="[frameClasses, disabled ? 'cursor-not-allowed bg-surface-muted' : 'bg-surface']"
    >
      <Icon
        v-if="icon"
        :name="icon"
        class="size-4 shrink-0"
        :class="error ? 'text-danger' : 'text-fg-secondary'"
      />

      <!-- Chrome is stripped here because the frame owns it: no border,
           no ring, and a transparent fill so the frame's background and
           rounded corners are the ones you see. -->
      <!-- Forwarded attributes come FIRST so the bindings below win a
           collision. A stray `id` would otherwise break the label's
           `for`, and a stray `aria-describedby` would silently detach
           the error message. -->
      <input
        v-bind="inputAttrs"
        :id="inputId"
        v-model="value"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : undefined"
        class="min-w-0 flex-1 border-none bg-transparent text-preset-3 text-fg-heading outline-none placeholder:text-fg-heading/50 disabled:cursor-not-allowed"
      >

      <!-- The message sits inside the box, right-aligned, per the design.
           `shrink-0` keeps it whole and lets the input give up width. -->
      <span
        v-if="error"
        :id="errorId"
        class="shrink-0 text-preset-4 text-danger"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>
