<script setup lang="ts">
useHead({ title: 'Profile Details' })
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-10 p-10">
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-1 text-fg-heading">Profile Details</h1>
      <p class="text-preset-3 text-fg-secondary">
        Add your details to create a personal touch to your profile.
      </p>
    </header>

    <!-- Placeholder: this tab exists so the header nav has a real second
         destination. The form comes with its own pass. -->
    <div class="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-canvas p-6">
      <p class="text-preset-3 text-fg-secondary">Coming soon.</p>
    </div>
  </div>
</template>
