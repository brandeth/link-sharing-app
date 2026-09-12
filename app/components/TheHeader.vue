<template>
  <!-- The bar is a white card floating on the canvas rather than a
       full-bleed header, so the 24px page gutter wraps it on all four
       sides. The left pad is 24px against 16px elsewhere: the logo mark
       has no optical bearing of its own, while the Preview button's
       border does. -->
  <header class="p-6">
    <div class="rounded-xl bg-surface py-4 pr-4 pl-6">
      <div class="flex h-14 items-center justify-between">
        <TheLogo size="sm" />

        <nav class="flex items-center gap-4">
          <NavTab to="/links" icon="ph:link-bold">Links</NavTab>
          <NavTab to="/profile-details" icon="ph:user-circle-bold">
            Profile Details
          </NavTab>
        </nav>

        <BaseButton variant="secondary">Preview</BaseButton>
      </div>
    </div>
  </header>
</template>
