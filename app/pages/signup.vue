<script setup lang="ts">
import { BackendError } from '~/backend'

useHead({ title: 'Create account' })
definePageMeta({ layout: 'auth', middleware: 'guest' })

const MIN_PASSWORD_LENGTH = 8

const { signUp } = useSession()
const { show: showToast } = useToast()

const submitting = ref(false)

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

/* Same rhythm as the login page: errors clear as soon as the field is
   edited and only come back on the next submit, so the red state never
   fights a fix in progress. Editing the password also clears the
   confirm error, since a mismatch can be fixed from either side. */
watch(email, () => { emailError.value = '' })
watch(password, () => { passwordError.value = ''; confirmPasswordError.value = '' })
watch(confirmPassword, () => { confirmPasswordError.value = '' })

async function onSubmit() {
  emailError.value = !email.value ? 'Can\'t be empty' : !EMAIL_RE.test(email.value) ? 'Please check again' : ''
  passwordError.value = !password.value ? 'Can\'t be empty' : password.value.length < MIN_PASSWORD_LENGTH ? 'Please check again' : ''
  confirmPasswordError.value = !confirmPassword.value ? 'Can\'t be empty' : confirmPassword.value !== password.value ? 'Please check again' : ''

  if (emailError.value || passwordError.value || confirmPasswordError.value) return

  submitting.value = true
  try {
    await signUp(email.value, password.value)
    await navigateTo('/links')
  }
  catch (error) {
    if (error instanceof BackendError && error.code === 'email-taken') {
      emailError.value = 'Already registered'
    }
    else {
      console.error(error)
      showToast('Something went wrong. Please try again.', 'ph:warning-circle-bold')
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- Mirrors login.vue: 40px between the header and the field group,
         24px between everything inside the group. -->
    <header class="flex flex-col gap-2">
      <h1 class="text-preset-2 text-fg-heading sm:text-preset-1">Create account</h1>
      <p class="text-preset-3 text-fg-secondary">
        Let's get you started sharing your links!
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
        label="Create password"
        type="password"
        icon="ph:lock-key-fill"
        placeholder="At least 8 characters"
        autocomplete="new-password"
        :error="passwordError"
      />
      <!-- The requirement line hangs off the confirm field, as in the
           reference, where the pair reads as one 108px block. -->
      <BaseInput
        v-model="confirmPassword"
        label="Confirm password"
        type="password"
        icon="ph:lock-key-fill"
        placeholder="At least 8 characters"
        autocomplete="new-password"
        hint="Password must contain at least 8 characters"
        :error="confirmPasswordError"
      />
      <BaseButton type="submit" class="w-full" :disabled="submitting">Create new account</BaseButton>

      <!-- One line on desktop; below `sm` the mobile frame stacks it two
           lines tall, with "Login" on its own centred line — the same
           treatment login.vue gives its sign-up prompt. -->
      <p class="text-preset-3 text-center text-fg-secondary">
        Already have an account?
        <NuxtLink to="/login" class="block text-brand hover:underline sm:inline">Login</NuxtLink>
      </p>
    </form>
  </div>
</template>
