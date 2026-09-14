<script setup lang="ts">
const { links } = useLinks()
const { profile, fullName } = useProfile()

/* The mockup always shows five link rows: the user's links first, then
   grey placeholders for the rest. */
const SLOTS = 5
const placeholders = computed(() => Math.max(0, SLOTS - links.value.length))

const previewLinks = computed(() =>
  links.value.map(link => ({ id: link.id, platform: getPlatform(link.platform) })),
)
</script>

<template>
  <!-- The phone mockup, drawn in markup rather than shipped as an image
       asset: it is two stroked rounded rects and a notch, so an inline
       SVG costs less than the request and takes its stroke from the
       token rather than a baked-in hex.

       The frame is fixed at its design size (307 x 631) and the content
       is positioned against it, so the two can never drift apart. It is
       `aria-hidden` because it only mirrors the editor beside it: every
       link it shows is already announced there as a form field. -->
  <div class="relative h-[631px] w-[307px] shrink-0" aria-hidden="true">
    <svg
      class="absolute inset-0 text-fg-secondary"
      width="307"
      height="631"
      viewBox="0 0 307 631"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Outer shell. -->
      <rect
        x="0.5"
        y="0.5"
        width="306"
        height="630"
        rx="42.5"
        stroke="currentColor"
      />
      <!-- Screen bezel and notch, as one path so the notch reads as a
           bite out of the bezel rather than a shape laid over it. -->
      <path
        d="M43.5 10.5H77V26.5A16 16 0 0 0 93 42.5H214A16 16 0 0 0 230 26.5V10.5H263.5A32 32 0 0 1 295.5 42.5V588.5A32 32 0 0 1 263.5 620.5H43.5A32 32 0 0 1 11.5 588.5V42.5A32 32 0 0 1 43.5 10.5Z"
        fill="var(--color-white)"
        stroke="currentColor"
      />
    </svg>

    <!-- Inset from the frame by the reference's own offsets: 34.5px from
         the left edge, 63.5px from the top. -->
    <div class="absolute top-[63.5px] left-[34.5px] flex w-[237px] flex-col gap-14">
      <!-- Each profile line is text once filled in and a skeleton pill
           until then. Every line keeps a fixed height either way, so the
           link rows below never move as the user types. -->
      <div class="flex flex-col items-center gap-[25px]">
        <div
          class="size-24 overflow-hidden rounded-full bg-surface-placeholder"
          :class="{ 'border-4 border-brand': profile.avatar }"
        >
          <img v-if="profile.avatar" :src="profile.avatar" alt="" class="size-full object-cover">
        </div>
        <div class="flex w-full flex-col items-center gap-[13px]">
          <p v-if="fullName" class="-my-1 h-6 w-full truncate text-center text-preset-3-semibold text-fg-heading">
            {{ fullName }}
          </p>
          <div v-else class="h-4 w-40 rounded-full bg-surface-placeholder" />

          <p v-if="profile.email" class="-my-[5px] h-[18px] w-full truncate text-center text-preset-4 text-fg-secondary">
            {{ profile.email }}
          </p>
          <div v-else class="h-2 w-[72px] rounded-full bg-surface-placeholder" />
        </div>
      </div>

      <!-- Fixed at the height of five rows (5 x 44 + 4 x 20). Past five
           links the rows scroll inside the screen instead of running off
           the bottom of the phone. The scrollbar is hidden: at 237px it
           would visibly narrow the rows, and a wheel still scrolls it. -->
      <div class="flex h-[300px] flex-col gap-5 overflow-y-auto [scrollbar-width:none]">
        <!-- Each row takes its platform's brand fill. A light fill (only
             Frontend Mentor) gets a border and dark text, or it would be
             a white label on a white screen. -->
        <div
          v-for="{ id, platform } in previewLinks"
          :key="id"
          class="flex h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-preset-4"
          :class="platform.light ? 'border border-border text-fg-heading' : 'text-white'"
          :style="{ backgroundColor: platform.color }"
        >
          <Icon :name="platform.icon" size="16" class="shrink-0" />
          <span class="min-w-0 flex-1 truncate">{{ platform.label }}</span>
          <Icon
            name="mdi:arrow-right"
            size="16"
            class="shrink-0"
            :class="{ 'text-fg-secondary': platform.light }"
          />
        </div>

        <div
          v-for="slot in placeholders"
          :key="`placeholder-${slot}`"
          class="h-11 shrink-0 rounded-lg bg-surface-placeholder"
        />
      </div>
    </div>
  </div>
</template>
