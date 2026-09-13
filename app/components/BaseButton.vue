<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'md' | 'icon'

withDefaults(
  defineProps<{
    /** Visual style. */
    variant?: ButtonVariant
    /** Box metrics. `md` is the standard 56px text button; `icon` is the
        52px square used where a control shows only its icon (the mobile
        header). An `icon` button carries no label, so give it one with
        `aria-label`. */
    size?: ButtonSize
    /** Native button type. */
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** Route to navigate to. When set the button renders as a link
        (`NuxtLink`) wearing the same box, since a control that changes
        page is a link to assistive tech. `type` and `disabled` do not
        apply to a link and are dropped. */
    to?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    to: undefined,
  },
)

const NuxtLink = resolveComponent('NuxtLink')

/* Every variant carries a 1px border so the box metrics stay identical
   and only the border colour changes between them.

   Interactive fills are gated behind `not-disabled:`. Chrome happens to
   suppress :hover painting on disabled form controls, but that is a
   browser quirk rather than a guarantee — other engines do paint it.

   Primary keeps white label text on hover per spec, even though the
   lighter hover fill puts it at 1.98:1 — below the 4.5:1 WCAG floor.
   Secondary needs no such trade-off: purple-600 on purple-100 is
   already 4.97:1.

   DISABLED is per-variant: the button dims its own colours rather than
   turning into a grey control of some third kind. A disabled primary is
   the brand at 25% (composites to #D8CEFF on white) under a
   full-strength white label — 1.48:1, which WCAG 1.4.3 exempts as an
   inactive component, and which is the point: the control has to look
   unavailable. A grey fill with a grey border did the opposite here, it
   read as an ENABLED outline button sitting under the real one.

   Note this is `bg-brand/25` on the fill, NOT `opacity: 0.25` on the
   button as the Figma export literally says: element opacity fades the
   label too, landing it near 1.25:1 over the same lavender — dimmer
   than the mockup it is meant to reproduce.

   Fields do NOT follow this (see BaseInput): a disabled field still
   carries a label and a value the user needs in order to read the form,
   so it keeps its contrast and marks itself with a muted fill instead.
   The rule: inert controls that still carry information stay legible;
   inert controls that carry only an action go dim. */
/* Height and padding live here rather than in the base class string, so
   a caller never has to fight Tailwind's conflict resolution to resize a
   button — the map is the single source for the box. */
const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-14 px-6 py-4',
  icon: 'size-13 p-4',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-brand text-white not-disabled:hover:bg-brand-hover disabled:bg-brand/25',
  secondary:
    'border-brand bg-surface text-brand not-disabled:hover:bg-brand-subtle not-disabled:active:bg-brand-subtle disabled:border-brand/25 disabled:text-brand/25',
}
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border text-preset-3-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed"
    :class="[variantClasses[variant], sizeClasses[size]]"
  >
    <slot />
  </component>
</template>
