<script setup lang="ts">
useHead({ title: 'Links' })
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { links, errors, add, remove, clearError } = useLinks()

const list = ref<HTMLOListElement>()
const addButton = ref<{ $el: HTMLButtonElement }>()

/* Bring the new card into view: with a few links already open it would
   otherwise land below the fold with nothing to show it was added. */
async function onAdd() {
  add()
  await nextTick()
  list.value?.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

/* The Remove button that had focus is gone once its card is, which
   would drop focus to the document body. Hand it back to "Add new
   link", the one control guaranteed to still be on the page. */
function onRemove(id: string) {
  remove(id)
  addButton.value?.$el.focus()
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-10 p-6 sm:p-10">
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-2 text-fg-heading sm:text-preset-1">Customize your links</h1>
      <p class="text-preset-3 text-fg-secondary">
        Add/edit/remove links below and then share all your profiles with the world!
      </p>
    </header>

    <div class="flex min-h-0 flex-1 flex-col gap-6">
      <BaseButton ref="addButton" variant="secondary" class="w-full" @click="onAdd">
        + Add new link
      </BaseButton>

      <!-- The well the links will fill. It is `canvas` inside a white
           card — the one place the page colour appears above a surface —
           which is what makes the empty state read as a container
           waiting for content rather than as blank card. Once there are
           links the grey moves onto each card instead, and the list
           itself is bare. -->
      <div
        v-if="!links.length"
        class="flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-xl bg-canvas p-6"
      >
        <EmptyLinks />
      </div>

      <!-- `contain: size` stops the list's own content from counting
           towards the height of the page. Without it, every card added
           grows the shell and the page scrolls Save out of view; with it,
           the list takes whatever room the card has left and scrolls.
           The intrinsic height is one card (252px), so a short window
           grows the page enough to show at least one link rather than
           crushing the list to nothing.

           Scoped to the list rather than capping the shell at the
           viewport: a capped shell also squeezes the phone preview and
           the empty state, which should never scroll. -->
      <ol
        v-else
        ref="list"
        class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto contain-size [contain-intrinsic-height:252px]"
      >
        <li v-for="(link, index) in links" :key="link.id">
          <LinkCard
            v-model:platform="link.platform"
            v-model:url="link.url"
            :number="index + 1"
            :error="errors[link.id]"
            @update:platform="clearError(link.id)"
            @update:url="clearError(link.id)"
            @remove="onRemove(link.id)"
          />
        </li>
      </ol>
    </div>
  </div>
</template>
