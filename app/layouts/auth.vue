<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-12 bg-canvas p-8">
    <!-- The centred shell the reference calls "Container": the logo stacked
         48px above the card, the pair capped at the card's own 476px and
         pinned to the middle of the viewport. `min-h-screen` (not a fixed
         height) lets the page scroll rather than clip on a short window. -->
    <TheLogo />

    <!-- The card. Below `sm` it drops its fill and padding so the form sits
         straight on the canvas — the reference's mobile behaviour — leaving
         the <main> padding as the only gutter. -->
    <div class="w-full max-w-[476px] rounded-xl p-0 sm:bg-surface sm:p-10">
      <slot />
    </div>
  </main>
</template>
