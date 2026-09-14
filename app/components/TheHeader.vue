<script setup lang="ts">
const { hasUnsavedChanges, signOut } = useSession()
const { show: showToast } = useToast()

/* The button sits beside Preview, where a stray click is easy, so
   unsaved edits get a chance to stay. */
async function onLogOut() {
  if (hasUnsavedChanges.value && !window.confirm('You have unsaved changes. Log out anyway?')) return

  await signOut()
  await navigateTo('/login')
  showToast('You have been logged out.', 'ph:sign-out-bold')
}
</script>

<template>
  <!-- At `sm` and up the bar is a white card floating on the canvas, so
       the 24px page gutter wraps it on all four sides. Below `sm` the
       gutter is dropped and the card goes full-bleed against the top
       edge, keeping its 12px radius (the mobile reference rounds all
       four corners even where two of them meet the viewport).

       The card's own padding is the same at every width — the left pad
       is 24px against 16px elsewhere, because the logo mark has no
       optical bearing of its own while the Preview button's border
       does. Only the row height steps, 52px to 56px. -->
  <header class="sm:p-6">
    <div class="rounded-xl bg-surface py-4 pr-4 pl-6">
      <div class="flex h-13 items-center justify-between sm:h-14">
        <TheLogo size="sm" wordmark="sm" />

        <!-- The tabs sit flush below `xl` (the tablet reference's nav is
             297px = 116 + 181, against desktop's 313px with its 16px gap).
             Their own 24px padding still leaves 48px between the labels. -->
        <nav class="flex items-center xl:gap-4">
          <NavTab to="/links" icon="ph:link-bold">Links</NavTab>
          <NavTab to="/profile-details" icon="ph:user-circle-bold">
            Profile Details
          </NavTab>
        </nav>

        <!-- Two buttons rather than one that restyles, because the mobile
             control is a square icon button with an `aria-label` and the
             wider one is a text button — different boxes and different
             accessible names. The wrappers own the show/hide so neither
             `display` class has to outrank BaseButton's own. -->
        <div class="flex items-center gap-2">
          <div class="sm:hidden">
            <BaseButton to="/preview" variant="secondary" size="icon" aria-label="Preview">
              <Icon name="ph:eye-bold" size="20" />
            </BaseButton>
          </div>
          <div class="hidden sm:block">
            <BaseButton to="/preview" variant="secondary">Preview</BaseButton>
          </div>

          <!-- Not in the reference, so it takes the least room it can:
               an icon box at every width. It matches the 52px mobile
               Preview below `sm` and grows to the 56px text Preview
               beside it from `sm`, so the pair share a height. -->
          <BaseButton variant="secondary" size="icon" class="sm:size-14" aria-label="Log out" title="Log out" @click="onLogOut">
            <Icon name="ph:sign-out-bold" size="20" />
          </BaseButton>
        </div>
      </div>
    </div>
  </header>
</template>
