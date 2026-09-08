<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary'

withDefaults(
  defineProps<{
    /** Visual style. */
    variant?: ButtonVariant
    /** Native button type. */
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
  },
)

/* Every variant carries a 1px border so the box metrics stay identical
   and only the border colour changes between them.

   Interactive fills are gated behind `not-disabled:`. Chrome happens to
   suppress :hover painting on disabled form controls, but that is a
   browser quirk rather than a guarantee — other engines do paint it. */
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand text-white not-disabled:hover:bg-brand-hover',
  secondary:
    'border-brand bg-surface text-brand not-disabled:hover:bg-brand-subtle not-disabled:active:bg-brand-subtle',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg border px-6 py-4 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-25"
    :class="variantClasses[variant]"
  >
    <slot />
  </button>
</template>
