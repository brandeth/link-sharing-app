<script setup lang="ts">
useHead({ title: 'Login' })
definePageMeta({ layout: 'auth' })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

/* Re-validating on every keystroke would flash a fresh error before the
   user finishes fixing it; clearing on edit and only re-checking on the
   next submit keeps the red state from fighting the fix in progress. */
watch(email, () => { emailError.value = '' })
watch(password, () => { passwordError.value = '' })

function onSubmit() {
  emailError.value = !email.value ? 'Can\'t be empty' : !EMAIL_RE.test(email.value) ? 'Please check again' : ''
  passwordError.value = !password.value ? 'Can\'t be empty' : ''

  if (emailError.value || passwordError.value) return

  // TODO: call the auth endpoint. No backend yet; `.prevent` already stops
  // the native form navigation.
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- The card's inner stack: the header sits 40px above the field group
         (the reference's outer gap), and everything inside the group —
         inputs, submit, sign-up prompt — is 24px apart. -->
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-2 text-fg-heading sm:text-preset-1">Login</h1>
      <p class="text-preset-3 text-fg-secondary">
        Add your details below to get back into the app
      </p>
    </header>

    <form class="flex flex-col gap-6" novalidate @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        label="Email address"
        type="email"
        icon="ph:envelope-simple-fill"
        placeholder="e.g. alex@email.com"
        autocomplete="email"
        :error="emailError"
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        icon="ph:lock-key-fill"
        placeholder="Enter your password"
        autocomplete="current-password"
        :error="passwordError"
      />
      <BaseButton type="submit" class="w-full">Login</BaseButton>

      <!-- One line on desktop; below `sm` the reference stacks it two
           lines tall (48px), so the link becomes its own centred block
           and "Create account" never breaks mid-phrase. -->
      <p class="text-preset-3 text-center text-fg-secondary">
        Don't have an account?
        <NuxtLink to="/signup" class="block text-brand hover:underline sm:inline">Create account</NuxtLink>
      </p>
    </form>
  </div>
</template>
