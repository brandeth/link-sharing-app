<script setup lang="ts">
const { toast } = useToast()
</script>

<template>
  <!-- The live region is always in the page and only its content
       changes: a region inserted together with its message is often not
       announced at all. -->
  <div
    class="pointer-events-none fixed inset-x-4 bottom-10 z-50 flex justify-center"
    role="status"
    aria-live="polite"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <p
        v-if="toast"
        :key="toast.id"
        class="flex items-center gap-2 rounded-xl bg-surface-inverse px-6 py-4 text-preset-3-semibold text-fg-inverse shadow-card"
      >
        <Icon :name="toast.icon" size="20" class="shrink-0 text-fg-secondary" />
        {{ toast.message }}
      </p>
    </Transition>
  </div>
</template>
