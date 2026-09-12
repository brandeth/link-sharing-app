<script setup lang="ts">
useHead({ title: 'Links' })
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-10 p-10">
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-1 text-fg-heading">Customize your links</h1>
      <p class="text-preset-3 text-fg-secondary">
        Add/edit/remove links below and then share all your profiles with the world!
      </p>
    </header>

    <div class="flex min-h-0 flex-1 flex-col gap-6">
      <BaseButton variant="secondary" class="w-full">+ Add new link</BaseButton>

      <!-- The well the links will fill. It is `canvas` inside a white
           card — the one place the page colour appears above a surface —
           which is what makes the empty state read as a container
           waiting for content rather than as blank card. -->
      <div class="flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-xl bg-canvas p-6">
        <EmptyLinks />
      </div>
    </div>
  </div>
</template>
