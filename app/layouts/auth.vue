<template>
  <main
    class="flex min-h-screen flex-col items-start gap-16 bg-surface p-8 sm:items-center sm:justify-center sm:gap-12 sm:bg-canvas"
  >
    <!-- The shell the reference calls "Container". Two treatments:
         · below `sm` — the mobile frame — the page is white, the logo sits
           top-left in the 32px gutter and the form is 64px below it, with
           the slack left at the bottom.
         · `sm` and up, it becomes the centred card layout: grey canvas,
           logo 48px above a 476px-capped card pinned to the viewport middle.
         `min-h-screen` (not a fixed height) lets a short window scroll
         rather than clip. -->
    <TheLogo />

    <!-- The card. Below `sm` it has no fill or padding, so the form sits
         straight on the white page and the <main> padding is the only
         gutter; at `sm` it gains the white fill and 40px pad. -->
    <div class="w-full max-w-[476px] rounded-xl sm:bg-surface sm:p-10">
      <slot />
    </div>
  </main>
</template>
