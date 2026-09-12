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
      class="flex h-14 items-center gap-2 rounded-lg px-6 py-4 text-preset-3-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      :class="isActive
        ? 'bg-surface-selected text-brand'
        : 'text-fg-secondary hover:text-brand'"
      @click="navigate"
    >
      <Icon :name="icon" class="size-5 shrink-0" />
      <slot />
    </a>
  </NuxtLink>
</template>
