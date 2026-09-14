export interface Profile {
  firstName: string
  lastName: string
  email: string
  /** Image URL: the stored image once saved, or an object URL for a
   *  picked image that has not been saved yet. Empty for none. */
  avatar: string
}

function emptyProfile(): Profile {
  return { firstName: '', lastName: '', email: '', avatar: '' }
}

/** The fields the form validates. The avatar is optional and checked on
 *  upload instead, so it has no entry here. */
export type ProfileField = 'firstName' | 'lastName' | 'email'

/* A comparable fingerprint of the profile, built field by field like
   the links' one in useLinks. */
function snapshot({ firstName, lastName, email, avatar }: Profile) {
  return JSON.stringify([firstName, lastName, email, avatar])
}

/* The user's profile details, shared the same way as `useLinks`: the
   Profile Details form will write it, and the preview page (and later
   the phone mockup) read it. Every field starts empty — readers show a
   placeholder rather than invented copy until the form fills them. */
export function useProfile() {
  const profile = useState<Profile>('profile', emptyProfile)

  /* The image picked since the last save. The form previews it straight
     away through an object URL in `profile.avatar`; the file itself is
     only uploaded on save. Held with `markRaw` because a reactive proxy
     is not a Blob, and FileReader and uploads reject it. */
  const avatarFile = useState<File | null>('profile-avatar-file', () => null)

  /* The profile as last saved or loaded, to tell whether there are edits
     that would be lost. A newly picked image counts through its object
     URL, which never matches a stored one. */
  const saved = useState('profile-saved', () => snapshot(emptyProfile()))
  const hasUnsavedChanges = computed(() => snapshot(profile.value) !== saved.value)

  /* Taken while the Nuxt context is available; `save` uses it after an
     `await`, where the context is gone. */
  const { $backend: backend } = useNuxtApp()

  const fullName = computed(() =>
    [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' '),
  )

  /* Messages keyed by field, shared like the links' errors: Save in the
     layout raises them, the Profile Details form shows them. */
  const errors = useState<Partial<Record<ProfileField, string>>>('profile-errors', () => ({}))

  /* Names are required; email is optional but must look like one when
     given. Copy matches the login and signup forms. */
  function validate(): boolean {
    const { firstName, lastName, email } = profile.value
    const next: Partial<Record<ProfileField, string>> = {}

    if (!firstName.trim()) next.firstName = 'Can\'t be empty'
    if (!lastName.trim()) next.lastName = 'Can\'t be empty'
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = 'Please check again'

    errors.value = next
    return Object.keys(next).length === 0
  }

  /* Cleared on edit and only re-checked on the next save, the same as
     every other form in the app. */
  function clearError(field: ProfileField) {
    if (!(field in errors.value)) return
    const { [field]: _removed, ...rest } = errors.value
    errors.value = rest
  }

  /* Shows a picked image right away and keeps the file for the next
     save. `previewUrl` is an object URL for the file. */
  function pickAvatar(file: File, previewUrl: string) {
    releasePreview()
    avatarFile.value = markRaw(file)
    profile.value.avatar = previewUrl
  }

  /* An object URL holds its file in memory until revoked, so one that is
     being replaced is released. Stored images are plain URLs and are
     left alone. */
  function releasePreview() {
    if (profile.value.avatar.startsWith('blob:')) URL.revokeObjectURL(profile.value.avatar)
  }

  /* Validates, uploads a newly picked image, then stores the profile.
     Returns false when validation fails, leaving the messages on the
     form; backend failures throw. */
  async function save(userId: string) {
    if (!validate()) return false

    const file = avatarFile.value
    if (file) {
      const url = await backend.uploadAvatar(userId, file)
      releasePreview()
      profile.value.avatar = url
      avatarFile.value = null
    }

    await backend.saveProfile(userId, profile.value)
    saved.value = snapshot(profile.value)
    return true
  }

  async function load(userId: string) {
    const stored = await backend.loadProfile(userId)
    reset()
    if (stored) profile.value = stored
    saved.value = snapshot(profile.value)
  }

  function reset() {
    releasePreview()
    profile.value = emptyProfile()
    avatarFile.value = null
    saved.value = snapshot(profile.value)
    errors.value = {}
  }

  return { profile, hasUnsavedChanges, fullName, errors, validate, clearError, pickAvatar, save, load, reset }
}
