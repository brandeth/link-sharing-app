import { createClient, type AuthError, type User as SupabaseUser } from '@supabase/supabase-js'
import type { Link } from '~/composables/useLinks'
import type { Profile } from '~/composables/useProfile'
import { BackendError, type Backend, type User } from './types'

/* The production backend: Supabase Auth for accounts, Postgres for the
   profile and links, Storage for avatars. The tables, the `save_links`
   function, the bucket and every access rule are defined in
   supabase/migrations/. Row-level security there is what keeps one user
   out of another's data; nothing here is trusted to. */

const AVATAR_BUCKET = 'avatars'

interface ProfileRow {
  first_name: string
  last_name: string
  email: string
  avatar_url: string
}

function toUser(user: SupabaseUser): User {
  return { id: user.id, email: user.email ?? '' }
}

/* Maps the auth errors a form can explain onto the shared codes. The
   rest are rethrown for the page's generic "something went wrong". */
function authError(error: AuthError): Error {
  switch (error.code) {
    case 'invalid_credentials':
      return new BackendError('invalid-credentials', error.message)
    case 'user_already_exists':
    case 'email_exists':
      return new BackendError('email-taken', error.message)
    case 'email_not_confirmed':
      return new BackendError('email-not-confirmed', error.message)
    default:
      return error
  }
}

export function createSupabaseBackend(url: string, publishableKey: string): Backend {
  /* The session is kept in localStorage and refreshed by the client. */
  const client = createClient(url, publishableKey)

  return {
    async signUp(email, password) {
      const { data, error } = await client.auth.signUp({ email: email.trim(), password })
      if (error) throw authError(error)

      /* With email confirmation on, signing up an address that is already
         registered does not fail, so as not to reveal that it exists. It
         returns a user with no identities instead. */
      if (data.user && data.user.identities?.length === 0) throw new BackendError('email-taken')

      /* No session means the confirmation email has been sent and the
         account cannot sign in until the link in it is opened. */
      return data.session && data.user ? toUser(data.user) : null
    },

    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw authError(error)
      return toUser(data.user)
    },

    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) throw error
    },

    /* Read from the stored session rather than asked of the server: this
       only decides where to route, and every request made with a stale or
       forged session is still refused by row-level security. */
    async currentUser() {
      const { data, error } = await client.auth.getSession()
      if (error) throw error
      return data.session ? toUser(data.session.user) : null
    },

    async loadProfile(userId) {
      const { data, error } = await client
        .from('profiles')
        .select('first_name, last_name, email, avatar_url')
        .eq('id', userId)
        .maybeSingle<ProfileRow>()
      if (error) throw error
      if (!data) return null

      return {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        avatar: data.avatar_url,
      } satisfies Profile
    },

    async saveProfile(userId, profile) {
      const { error } = await client.from('profiles').upsert({
        id: userId,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        avatar_url: profile.avatar,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
    },

    async loadLinks(userId) {
      const { data, error } = await client
        .from('links')
        .select('id, platform, url')
        .eq('user_id', userId)
        .order('position')
      if (error) throw error
      return data as Link[]
    },

    /* The list is replaced whole, in one transaction inside the database
       function, so a failure part-way can never leave half a list. The
       user comes from the session there, not from this call. */
    async saveLinks(_userId, links) {
      const items = links.map(({ id, platform, url }) => ({ id, platform, url }))
      const { error } = await client.rpc('save_links', { items })
      if (error) throw error
    },

    /* One file per user, overwritten on each upload. The public URL never
       changes, so a version is added to it: without one, browsers and the
       CDN would keep showing the old image. */
    async uploadAvatar(userId, file) {
      const path = `${userId}/avatar`
      const { error } = await client.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error

      const { data } = client.storage.from(AVATAR_BUCKET).getPublicUrl(path)
      return `${data.publicUrl}?v=${Date.now()}`
    },
  }
}
