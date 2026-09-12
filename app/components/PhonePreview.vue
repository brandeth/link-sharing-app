<template>
  <!-- The phone mockup, drawn in markup rather than shipped as an image
       asset: it is two stroked rounded rects and a notch, so an inline
       SVG costs less than the request and takes its stroke from the
       token rather than a baked-in hex.

       The frame is fixed at its design size (307 x 631) and the content
       is positioned against it, so the two can never drift apart. The
       whole thing is decorative — it is a skeleton of content the user
       has not entered yet, with nothing for a screen reader to read —
       hence `aria-hidden`. -->
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
      <div class="flex flex-col items-center gap-[25px]">
        <div class="size-24 rounded-full bg-surface-placeholder" />
        <div class="flex flex-col items-center gap-[13px]">
          <div class="h-4 w-40 rounded-full bg-surface-placeholder" />
          <div class="h-2 w-[72px] rounded-full bg-surface-placeholder" />
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div
          v-for="slot in 5"
          :key="slot"
          class="h-11 rounded-lg bg-surface-placeholder"
        />
      </div>
    </div>
  </div>
</template>
