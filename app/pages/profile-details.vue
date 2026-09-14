<script setup lang="ts">
useHead({ title: 'Profile Details' })
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { profile, errors, clearError, pickAvatar } = useProfile()

/* The limits the requirements text states. "Below 1024x1024" is read as
   at most 1024 on each side. */
const MAX_AVATAR_SIZE = 1024
const AVATAR_TYPES = ['image/png', 'image/jpeg']

const fileInput = ref<HTMLInputElement>()
const hintId = useId()

/* Set when a picked file breaks the rules. Rather than a separate
   message, the requirements text itself turns red: it already says what
   was wrong, and it is announced when it changes. */
const avatarRejected = ref(false)

function readDimensions(src: string) {
  return new Promise<{ width: number, height: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = reject
    image.src = src
  })
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  /* Cleared straight away so picking the same file again still fires
     `change`, e.g. after it was rejected. */
  input.value = ''
  if (!file) return

  avatarRejected.value = false
  if (!AVATAR_TYPES.includes(file.type)) {
    avatarRejected.value = true
    return
  }

  const src = URL.createObjectURL(file)
  try {
    const { width, height } = await readDimensions(src)
    if (width > MAX_AVATAR_SIZE || height > MAX_AVATAR_SIZE) throw new Error('too large')
  }
  catch {
    URL.revokeObjectURL(src)
    avatarRejected.value = true
    return
  }

  pickAvatar(file, src)
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-10 p-6 sm:p-10">
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-2 text-fg-heading sm:text-preset-1">Profile Details</h1>
      <p class="text-preset-3 text-fg-secondary">
        Add your details to create a personal touch to your profile.
      </p>
    </header>

    <!-- Save lives in the layout's footer, outside this form, so the form
         only exists to group the fields; `.prevent` stops Enter in a
         field from reloading the page. -->
    <form class="flex flex-col gap-6" novalidate @submit.prevent>
      <!-- Profile picture. Label | upload tile + requirements in a row
           from `sm`; stacked below it, as there is no room beside a
           193px tile. -->
      <section
        class="flex flex-col gap-4 rounded-xl bg-canvas p-5 sm:flex-row sm:items-center sm:p-6"
        aria-labelledby="avatar-label"
      >
        <h2 id="avatar-label" class="text-preset-3 text-fg-secondary sm:w-60 sm:shrink-0">
          Profile picture
        </h2>

        <div class="flex flex-col gap-6 sm:flex-1 sm:flex-row sm:items-center">
          <!-- The tile is the picker's visible control; the native input
               is visually hidden and driven from here. Once an image is
               set the tile shows it under a dark scrim, with the prompt
               turned white to read on top. -->
          <button
            type="button"
            class="group relative flex size-[193px] shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-surface-placeholder text-preset-3-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            :class="profile.avatar ? 'text-white' : 'text-brand'"
            :aria-describedby="hintId"
            @click="fileInput?.click()"
          >
            <template v-if="profile.avatar">
              <img :src="profile.avatar" alt="" class="absolute inset-0 size-full object-cover">
              <span class="absolute inset-0 bg-black/50" aria-hidden="true" />
            </template>

            <Icon name="ph:image" size="40" class="relative" />
            <span class="relative">{{ profile.avatar ? 'Change Image' : '+ Upload Image' }}</span>
          </button>

          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg"
            class="sr-only"
            tabindex="-1"
            aria-hidden="true"
            @change="onFileChange"
          >

          <p
            :id="hintId"
            class="text-preset-4 sm:flex-1"
            :class="avatarRejected ? 'text-danger' : 'text-fg-secondary'"
            aria-live="polite"
          >
            <!-- No forced break: at 1440 the text wraps after "px." on its
                 own, and on a narrower card a hard break would add a
                 fourth line. -->
            Image must be below 1024x1024px. Use PNG or JPG format.
          </p>
        </div>
      </section>

      <!-- Personal details. 16px between rows from `sm`, 12px below. -->
      <section class="flex flex-col gap-3 rounded-xl bg-canvas p-5 sm:gap-4 sm:p-6">
        <BaseInput
          v-model="profile.firstName"
          label="First name*"
          label-position="side"
          placeholder="e.g. John"
          autocomplete="given-name"
          required
          :error="errors.firstName"
          @update:model-value="clearError('firstName')"
        />
        <BaseInput
          v-model="profile.lastName"
          label="Last name*"
          label-position="side"
          placeholder="e.g. Appleseed"
          autocomplete="family-name"
          required
          :error="errors.lastName"
          @update:model-value="clearError('lastName')"
        />
        <BaseInput
          v-model="profile.email"
          label="Email"
          label-position="side"
          type="email"
          placeholder="e.g. email@example.com"
          autocomplete="email"
          :error="errors.email"
          @update:model-value="clearError('email')"
        />
      </section>
    </form>
  </div>
</template>
