<script setup lang="ts">
useHead({ title: 'Preview' })

const { links } = useLinks()
const { profile, fullName } = useProfile()

const previewLinks = computed(() =>
  links.value.map(link => ({ ...link, platform: getPlatform(link.platform) })),
)

/* Copies the page's address for now. There is no public profile route
   yet; when there is, this is the one line to point at it. The status
   text is announced to screen readers — the visible toast comes with
   its own design pass. */
const status = ref('')

async function onShare() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    status.value = 'The link has been copied to your clipboard!'
  }
  catch {
    status.value = 'Could not copy the link.'
  }
}
</script>

<template>
  <div class="relative min-h-screen bg-surface sm:bg-canvas">
    <!-- Mirrors the auth layout's split at `sm`: below it the page is
         white and the profile sits straight on it; from `sm` the page is
         canvas grey under a purple band, with the profile raised on a
         white card that straddles the band's bottom edge. -->
    <!-- The band is decoration behind the flow, fixed at the reference's
         357px so the card always overlaps it by the same amount. -->
    <div
      class="absolute inset-x-0 top-0 hidden h-[357px] rounded-b-[32px] bg-brand sm:block"
      aria-hidden="true"
    />

    <!-- Same card metrics as TheHeader: 24px gutter, 16/16/24 padding,
         56px row — 136px in all. On mobile the card and its padding go
         and the two buttons share the row. -->
    <header class="relative p-4 sm:p-6">
      <nav
        class="flex items-center justify-between gap-4 rounded-xl sm:bg-surface sm:py-4 sm:pr-4 sm:pl-6"
        aria-label="Preview actions"
      >
        <BaseButton to="/links" variant="secondary" class="flex-1 sm:flex-none">
          Back to Editor
        </BaseButton>
        <BaseButton class="flex-1 sm:flex-none" @click="onShare">
          Share Link
        </BaseButton>
      </nav>
      <p class="sr-only" role="status">{{ status }}</p>
    </header>

    <!-- In flow rather than absolutely centred as in the export: at
         1440x1024 an 88px top margin under the 136px header lands the
         card at the reference's 224px, and a short window scrolls
         instead of pushing the card up under the header. Height is the
         content's own, so more links grow the card rather than
         overflowing the reference's 576px. -->
    <main class="relative flex justify-center px-6 pt-15 pb-6 sm:pt-22">
      <article class="flex w-[237px] flex-col gap-14 rounded-3xl sm:w-[349px] sm:bg-surface sm:px-14 sm:py-12 sm:shadow-card">
        <div class="flex flex-col items-center gap-6">
          <div class="size-26 shrink-0 overflow-hidden rounded-full border-4 border-brand bg-surface-placeholder">
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              alt=""
              class="size-full object-cover"
            >
          </div>

          <div class="flex w-full flex-col items-center gap-2 text-center">
            <h1 v-if="fullName" class="text-preset-1 break-words text-fg-heading">
              {{ fullName }}
            </h1>
            <!-- Until the profile is filled in, placeholders hold each
                 line's height so the card does not jump when it is. -->
            <div v-else class="flex h-12 items-center">
              <h1 class="sr-only">Your profile</h1>
              <div class="h-4 w-40 rounded-full bg-surface-placeholder" />
            </div>

            <p v-if="profile.email" class="text-preset-3 break-all text-fg-secondary">
              {{ profile.email }}
            </p>
            <div v-else class="flex h-6 items-center">
              <div class="h-2 w-[72px] rounded-full bg-surface-placeholder" />
            </div>
          </div>
        </div>

        <ul v-if="previewLinks.length" class="flex flex-col gap-6">
          <li v-for="{ id, url, platform } in previewLinks" :key="id">
            <!-- Same fills as the phone mockup: each platform's brand
                 colour, with a border and dark text on the one light
                 fill (Frontend Mentor). -->
            <a
              :href="url || undefined"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-14 items-center gap-2 rounded-lg p-4 text-preset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              :class="platform.light ? 'border border-border text-fg-heading' : 'text-white'"
              :style="{ backgroundColor: platform.color }"
            >
              <Icon :name="platform.icon" size="20" class="shrink-0" />
              <span class="min-w-0 flex-1 truncate">{{ platform.label }}</span>
              <Icon
                name="mdi:arrow-right"
                size="16"
                class="shrink-0"
                :class="{ 'text-fg-secondary': platform.light }"
              />
            </a>
          </li>
        </ul>
      </article>
    </main>
  </div>
</template>
