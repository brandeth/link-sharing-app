<script setup lang="ts">
type ButtonVariant = 'primary'

withDefaults(
  defineProps<{
    /** Visual style. Only `primary` exists for now. */
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

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-purple-600 text-white hover:bg-purple-300',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex h-14 items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:cursor-not-allowed disabled:opacity-25"
    :class="variantClasses[variant]"
  >
    <slot />
  </button>
</template>
