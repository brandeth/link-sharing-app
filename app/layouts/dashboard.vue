<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <!-- The dashboard shell: the header bar, the persistent phone preview
         and the content card the routed page fills. Both tabs share all
         three, so they live here rather than in either page.

         `min-h-screen` with `min-h-0` on the row is what replaces the
         reference's fixed 1024/888/864px stack: the card grows to the
         viewport and the list inside it scrolls, instead of the design
         only holding together at exactly 1024px tall. -->
    <TheHeader />

    <main class="flex min-h-0 flex-1 gap-6 px-6 pb-6">
      <!-- Desktop-only for now; below `lg` this panel is dropped and the
           page becomes the content card alone (tablet/mobile pending). -->
      <section class="flex w-[560px] shrink-0 items-center justify-center overflow-auto rounded-xl bg-surface p-6">
        <PhonePreview />
      </section>

      <div class="flex min-w-0 flex-1 flex-col rounded-xl bg-surface">
        <slot />

        <!-- The divider runs the full width of the card while the button
             sits in the footer's own 40px gutter, so it lines up with the
             content above it rather than with the divider. -->
        <footer class="shrink-0">
          <div class="h-px bg-border" />
          <div class="flex justify-end px-10 py-6">
            <!-- Disabled until there is something to save. Form state will
                 drive this once the link editor lands. -->
            <BaseButton disabled>Save</BaseButton>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>
