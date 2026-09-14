<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Visible label, rendered above the field. */
    label?: string
    /** Where the label sits. `side` is the profile form's row: a 240px
     *  grey label beside the field from `sm`, stacked above it below. */
    labelPosition?: 'top' | 'side'
    /** Iconify name for the leading icon, e.g. `ph:link-bold`. */
    icon?: string
    /** Native input type. */
    type?: 'text' | 'email' | 'password' | 'url'
    placeholder?: string
    /** Validation message. Its presence *is* the error state. */
    error?: string
    /** Helper text under the field, e.g. a format requirement. Stays
     *  grey in every state: it describes the rule, the error reports
     *  the breach. */
    hint?: string
    disabled?: boolean
    /** Adds a show/hide toggle to a `password` field. Ignored for other
     *  types. */
    revealable?: boolean
  }>(),
  {
    type: 'text',
    labelPosition: 'top',
    disabled: false,
    revealable: true,
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
const input = ref<HTMLInputElement>()
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`

/* Both messages describe the control, so both are announced. The error
   goes first: when a field is read back it is the breach the user needs,
   the rule is context. */
const describedBy = computed(() => {
  const ids = [props.error && errorId, props.hint && hintId].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

/* Show/hide for password fields. Only the rendered `type` changes; the
   prop, and so what the caller asked for, stays `password`. */
const canReveal = computed(() => props.type === 'password' && props.revealable)
const revealed = ref(false)
const inputType = computed(() => (canReveal.value && revealed.value ? 'text' : props.type))

/* Hidden again whenever the form is submitted, so a password is not
   left on screen under an error, and the browser's "save password"
   prompt still finds a password field. Listened for on the form itself
   because the submit handler belongs to the page, not to this field. */
function hide() {
  revealed.value = false
}

onMounted(() => input.value?.form?.addEventListener('submit', hide, true))
onBeforeUnmount(() => input.value?.form?.removeEventListener('submit', hide, true))

/* Only the default state glows on focus. The error state keeps its
   plain red border, per the design — the glow would otherwise appear
   the moment Save focuses the first invalid field.

   Disabled is carried by the frame's fill instead — see the note on
   `surface-muted` in main.css for why it is not an opacity. */
const frameClasses = computed(() =>
  props.error
    ? 'border-danger'
    : 'border-border focus-within:border-brand focus-within:glow-brand',
)
</script>

<template>
  <!-- A `side` label keeps its 240px column only from `sm`; below it
       there is no room beside the field, so it stacks 4px above it with
       the mobile form's smaller type. -->
  <div
    class="flex w-full flex-col"
    :class="[
      labelPosition === 'side' ? 'gap-1 sm:flex-row sm:items-center sm:gap-4' : 'gap-2',
      $attrs.class,
    ]"
    :style="$attrs.style"
  >
    <label
      v-if="label"
      :for="inputId"
      :class="[
        labelPosition === 'side' ? 'text-preset-4 sm:w-60 sm:shrink-0 sm:text-preset-3' : 'text-preset-4',
        error ? 'text-danger' : labelPosition === 'side' ? 'text-fg-secondary' : 'text-fg-heading',
      ]"
    >
      {{ label }}
    </label>

    <!-- Frame and hint are grouped so a `side` row lays out as label |
         field, with the hint still hanging under the field. -->
    <div class="flex min-w-0 flex-1 flex-col gap-2">
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
        <!-- Matches the placeholder's colour (`fg-heading/50`) regardless of
             error state — the icon is decorative chrome, not a validation
             signal, so it never switches to `danger`. -->
        <Icon
          v-if="icon"
          :name="icon"
          class="size-4 shrink-0 text-fg-heading/50"
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
          ref="input"
          v-model="value"
          :type="inputType"
          :placeholder="placeholder"
          :disabled="disabled"
          :aria-invalid="error ? true : undefined"
          :aria-describedby="describedBy"
          class="min-w-0 flex-1 border-none bg-transparent text-preset-3 text-fg-heading outline-none placeholder:text-fg-heading/50 disabled:cursor-not-allowed"
        >

        <!-- The message sits inside the box, right-aligned, per the design.
             `shrink-0` keeps it whole and lets the input give up width.

             A `side` field moves it out of the box below `sm` (see the copy
             under the frame): on a phone the box is too narrow to hold a
             placeholder and "Can't be empty" side by side. This span keeps
             the id either way — `aria-describedby` still reads a hidden
             element's text, so the message is announced once, whichever
             copy is on screen. -->
        <span
          v-if="error"
          :id="errorId"
          class="shrink-0 text-preset-4 text-danger"
          :class="{ 'hidden sm:inline': labelPosition === 'side' }"
        >
          {{ error }}
        </span>

        <!-- Last in the row, so it stays put when an error appears beside
             it. A toggle button: the name is constant and `aria-pressed`
             carries the state.

             `mousedown.prevent` keeps focus, and so the caret, in the input
             when the eye is clicked; keyboard users still reach it by Tab.
             The negative margin widens the hit area to 32px without moving
             the icon off the 16px padding line. -->
        <button
          v-if="canReveal"
          type="button"
          class="-mr-2 flex shrink-0 cursor-pointer rounded-md p-2 text-fg-heading/50 transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand disabled:cursor-not-allowed disabled:hover:text-fg-heading/50"
          aria-label="Show password"
          :aria-pressed="revealed"
          :disabled="disabled"
          @mousedown.prevent
          @click="revealed = !revealed"
        >
          <Icon v-if="revealed" name="ph:eye-slash-bold" class="size-4" />
          <Icon v-else name="ph:eye-bold" class="size-4" />
        </button>
      </div>

      <!-- The mobile copy of a `side` field's message, under the box.
           `aria-hidden` because the span above already describes the input. -->
      <p
        v-if="error && labelPosition === 'side'"
        class="text-preset-4 text-danger sm:hidden"
        aria-hidden="true"
      >
        {{ error }}
      </p>

      <!-- Sits below the frame at the same 8px gap as the label above it,
           so the field reads as label / box / hint with even spacing. -->
      <p
        v-if="hint"
        :id="hintId"
        class="text-preset-4 text-fg-secondary"
      >
        {{ hint }}
      </p>
    </div>
  </div>
</template>
