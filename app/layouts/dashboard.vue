<script setup lang="ts">
const route = useRoute()
const { user } = useSession()
const { links, hasUnsavedChanges: linksChanged, save: saveLinks } = useLinks()
const { save: saveProfile } = useProfile()
const { show: showToast } = useToast()

const saving = ref(false)

/* Each tab saves its own form. Links needs a list to save, or unsaved
   changes to one, which is how removing every link still saves; the
   profile form can always be submitted, so an empty one gets its
   "Can't be empty" messages. Disabled while a save is in flight, so a
   double click cannot send it twice. */
const canSave = computed(() => !saving.value && (
  route.path === '/profile-details'
  || (route.path === '/' && (links.value.length > 0 || linksChanged.value))
))

async function onSave() {
  /* The auth middleware keeps signed-out users off these pages. */
  const userId = user.value!.id
  saving.value = true
  try {
    const saved = route.path === '/' ? await saveLinks(userId) : await saveProfile(userId)

    if (!saved) {
      /* Take the user to the first broken field. Focusing its input also
         scrolls it into view, and the error is read out through the
         input's `aria-describedby`. */
      await nextTick()
      document.querySelector<HTMLInputElement>('main [aria-invalid="true"]')?.focus()
      return
    }

    showToast('Your changes have been successfully saved!', 'ph:floppy-disk-bold')
  }
  catch (error) {
    console.error(error)
    showToast('Your changes could not be saved. Please try again.', 'ph:warning-circle-bold')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <!-- The dashboard shell: the header bar, the persistent phone preview
         and the content card the routed page fills. Both tabs share all
         three, so they live here rather than in either page.

         `min-h-screen` with `flex-1` down the chain is what replaces the
         reference's fixed 1024/888/864px stack: the card fills at least
         the viewport, and grows past it only when fixed content (the
         phone, the empty state) needs the room — never to fit the links
         list, which scrolls instead. The list opts out of sizing its
         ancestors with `contain: size`; see pages/index.vue. -->
    <TheHeader />

    <!-- The gutter is 16px on mobile and 24px from `sm`. Mobile needs a
         top pad of its own because the header sheds its gutter there. -->
    <main class="flex min-h-0 flex-1 gap-6 p-4 sm:px-6 sm:pt-0 sm:pb-6">
      <!-- Desktop only. The panel is a fixed 560px, so it comes back at
           `xl` rather than `lg`: at 1024 it would leave the content card
           392px and wrap the page title onto two lines, which neither
           reference sanctions. Hidden with CSS rather than `v-if` — the
           mockup is decoration, and paying ~1KB of inert markup buys a
           resize with no layout shift and no JS. -->
      <section class="hidden w-[560px] shrink-0 items-center justify-center overflow-auto rounded-xl bg-surface p-6 xl:flex">
        <PhonePreview />
      </section>

      <div class="flex min-w-0 flex-1 flex-col rounded-xl bg-surface">
        <slot />

        <!-- The divider runs the full width of the card while the button
             sits in the footer's own 40px gutter, so it lines up with the
             content above it rather than with the divider. -->
        <footer class="shrink-0">
          <div class="h-px bg-border" />
          <div class="flex justify-end p-4 sm:px-10 sm:py-6">
            <!-- Disabled until there is something to save.
                 Full width on mobile, hugging its label from `sm`. -->
            <BaseButton :disabled="!canSave" class="w-full sm:w-auto" @click="onSave">Save</BaseButton>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>
