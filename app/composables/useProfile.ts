export interface Profile {
  firstName: string
  lastName: string
  email: string
  /** Image URL (an object URL once the upload lands). Empty for none. */
  avatar: string
}

/* The user's profile details, shared the same way as `useLinks`: the
   Profile Details form will write it, and the preview page (and later
   the phone mockup) read it. Every field starts empty — readers show a
   placeholder rather than invented copy until the form fills them. */
export function useProfile() {
  const profile = useState<Profile>('profile', () => ({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
  }))

  const fullName = computed(() =>
    [profile.value.firstName, profile.value.lastName].filter(Boolean).join(' '),
  )

  return { profile, fullName }
}
