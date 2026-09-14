<script setup lang="ts">
import { BackendError } from '~/backend'

useHead({ title: 'Login' })
definePageMeta({ layout: 'auth', middleware: 'guest' })

const { signIn } = useSession()
const { show: showToast } = useToast()
const { $backend } = useNuxtApp()

/* Offered only by a backend that seeds one, i.e. local development. */
const testAccount = $backend.testAccount
const loginButton = ref<{ $el: HTMLButtonElement }>()

const submitting = ref(false)
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

/* Re-validating on every keystroke would flash a fresh error before the
   user finishes fixing it; clearing on edit and only re-checking on the
   next submit keeps the red state from fighting the fix in progress. */
watch(email, () => { emailError.value = '' })
watch(password, () => { passwordError.value = '' })

/* Fills the form rather than signing in, so what gets sent stays
   visible and editable — swap in a wrong password to see the error.
   Focus moves to Login so Enter finishes the job. */
function fillTestAccount() {
  if (!testAccount) return
  email.value = testAccount.email
  password.value = testAccount.password
  loginButton.value?.$el.focus()
}

async function onSubmit() {
  emailError.value = !email.value ? 'Can\'t be empty' : !EMAIL_RE.test(email.value) ? 'Please check again' : ''
  passwordError.value = !password.value ? 'Can\'t be empty' : ''

  if (emailError.value || passwordError.value) return

  submitting.value = true
  try {
    await signIn(email.value, password.value)
    await navigateTo('/links')
  }
  catch (error) {
    /* Wrong credentials are reported on the password without saying
       which half was wrong, so the form does not reveal whether an
       account exists for the email. */
    if (error instanceof BackendError && error.code === 'invalid-credentials') {
      passwordError.value = 'Please check again'
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
      <BaseButton ref="loginButton" type="submit" class="w-full" :disabled="submitting">Login</BaseButton>

      <!-- One line on desktop; below `sm` the reference stacks it two
           lines tall (48px), so the link becomes its own centred block
           and "Create account" never breaks mid-phrase. -->
      <p class="text-preset-3 text-center text-fg-secondary">
        Don't have an account?
        <NuxtLink to="/signup" class="block text-brand hover:underline sm:inline">Create account</NuxtLink>
      </p>
    </form>

    <!-- A developer aid, not part of the design: the dashed border and
         small type keep it from reading as a real feature. Outside the
         form so its button can never submit it. -->
    <section
      v-if="testAccount"
      class="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-labelledby="test-account-label"
    >
      <div class="flex min-w-0 flex-col text-preset-4">
        <h2 id="test-account-label" class="font-semibold text-fg-heading">Local test account</h2>
        <p class="break-all text-fg-secondary">
          {{ testAccount.email }} · {{ testAccount.password }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 cursor-pointer self-start rounded-md text-preset-4 font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:self-auto"
        @click="fillTestAccount"
      >
        Use test account
      </button>
    </section>
  </div>
</template>
