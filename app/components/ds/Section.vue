<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-2xl font-bold text-fg-heading">{{ title }}</h2>
      <p v-if="description" class="max-w-2xl text-fg-secondary">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>
