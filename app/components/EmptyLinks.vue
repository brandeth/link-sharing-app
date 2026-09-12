<script setup lang="ts">
/* Imported rather than written as a `src="~/assets/..."` literal so the
   path is resolved by the bundler at build time and a rename fails the
   build instead of shipping a broken image. */
import illustration from '~/assets/images/get-you-started.svg'
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-10 px-6 text-center">
    <!-- Decorative: the heading below already says everything the drawing
         does, so it carries an empty alt and stays out of the a11y tree.
         Height is fixed at the asset's own 160px; width follows. -->
    <img :src="illustration" alt="" aria-hidden="true" class="h-40 w-auto">

    <div class="flex max-w-[488px] flex-col items-center gap-6">
      <h2 class="text-preset-1 text-fg-heading">Let&rsquo;s get you started</h2>
      <p class="text-preset-3 text-fg-secondary">
        Use the &ldquo;Add new link&rdquo; button to get started. Once you have more
        than one link, you can reorder and edit them. We&rsquo;re here to help you
        share your profiles with everyone!
      </p>
    </div>
  </div>
</template>
