<script setup lang="ts">
useHead({ title: 'Login' })
definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')

function onSubmit() {
  // TODO: validate the fields, surface errors through BaseInput's `error`
  // prop, then call the auth endpoint. No backend yet; `.prevent` already
  // stops the native form navigation.
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- The card's inner stack: the header sits 40px above the field group
         (the reference's outer gap), and everything inside the group —
         inputs, submit, sign-up prompt — is 24px apart. -->
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-1 text-fg-heading">Login</h1>
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
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        icon="ph:lock-key-fill"
        placeholder="Enter your password"
        autocomplete="current-password"
      />
      <BaseButton type="submit" class="w-full">Login</BaseButton>

      <p class="text-preset-3 text-center text-fg-secondary">
        Don't have an account?
        <NuxtLink to="/signup" class="text-brand hover:underline">Create account</NuxtLink>
      </p>
    </form>
  </div>
</template>
