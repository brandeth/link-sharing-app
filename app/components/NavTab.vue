<script setup lang="ts">
defineProps<{
  /** Route this tab points at. */
  to: string
  /** Iconify name, e.g. `ph:link-bold`. Must be written as a literal at
      the call site — `clientBundle.scan` only finds statically written
      names (see nuxt.config.ts). */
  icon: string
}>()
</script>

<template>
  <!-- `custom` rather than NuxtLink's own `activeClass`, because the
       selected state changes the icon's colour as well as the anchor's
       fill, and the icon needs the flag rather than a class inherited
       from an ancestor. -->
  <NuxtLink v-slot="{ href, navigate, isActive }" :to="to" custom>
    <a
      :href="href ?? undefined"
      :aria-current="isActive ? 'page' : undefined"
      class="flex h-13 items-center gap-2 rounded-lg px-6 py-4 text-preset-3-semibold sm:h-14 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      :class="isActive
        ? 'bg-surface-selected text-brand'
        : 'text-fg-secondary hover:text-brand'"
      @click="navigate"
    >
      <!-- Sized with Icon's own `size` prop, not a `size-5` class: the
           component writes width/height as an inline style, which beats
           the utility and silently renders a 16px icon against the
           reference's 20px. -->
      <Icon :name="icon" size="20" class="shrink-0" />
      <!-- Below `sm` the tab is its icon alone. `sr-only` rather than
           `hidden` keeps the tab's accessible name at every width; it
           also takes the label out of flow, so the flex `gap` collapses
           with it and the box lands on the reference's 68px. -->
      <span class="sr-only sm:not-sr-only"><slot /></span>
    </a>
  </NuxtLink>
</template>
