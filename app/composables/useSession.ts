import type { User } from '~/backend'

/* The signed-in user, and the one place that signs in and out. Signing
   in also loads that user's saved profile and links into the shared
   state the editor and previews read, and signing out clears it, so no
   page ever shows one account's data under another. */
export function useSession() {
  const user = useState<User | null>('session-user', () => null)
  const restored = useState('session-restored', () => false)

  /* Everything that needs the Nuxt context is taken up front: after the
     first `await` below it is gone. */
  const { $backend: backend } = useNuxtApp()
  const linksStore = useLinks()
  const profileStore = useProfile()

  async function start(next: User) {
    await Promise.all([linksStore.load(next.id), profileStore.load(next.id)])
    user.value = next
  }

  /* Picks up the session from the previous visit. Runs once per page
     load; the route guards call it before deciding where to send you. */
  async function restore() {
    if (restored.value) return
    const current = await backend.currentUser()
    if (current) await start(current)
    restored.value = true
  }

  async function signIn(email: string, password: string) {
    await start(await backend.signIn(email, password))
  }

  /* Resolves to whether the new account is signed in. It is not when
     the backend wants the email confirmed first. */
  async function signUp(email: string, password: string) {
    const created = await backend.signUp(email, password)
    if (created) await start(created)
    return created !== null
  }

  /* Edits to either form that have not been saved, which signing out
     would throw away. */
  const hasUnsavedChanges = computed(() =>
    linksStore.hasUnsavedChanges.value || profileStore.hasUnsavedChanges.value,
  )

  /* The local session is cleared even when the backend call fails (a
     network error, say): being stuck signed in is worse than a stale
     server-side session. */
  async function signOut() {
    try {
      await backend.signOut()
    }
    catch (error) {
      console.error(error)
    }
    user.value = null
    linksStore.reset()
    profileStore.reset()
  }

  return { user, hasUnsavedChanges, restore, signIn, signUp, signOut }
}
