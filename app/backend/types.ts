import type { Link } from '~/composables/useLinks'
import type { Profile } from '~/composables/useProfile'

export interface User {
  id: string
  email: string
}

/* The expected failures a form can explain to the user. Each backend
   maps its own errors onto these, so the pages never need to know which
   backend they are talking to. Anything else is thrown as-is and treated
   as "something went wrong". */
export type BackendErrorCode =
  | 'invalid-credentials'
  | 'email-taken'
  /** The account exists but its confirmation link has not been opened. */
  | 'email-not-confirmed'

export class BackendError extends Error {
  constructor(public code: BackendErrorCode, message: string = code) {
    super(message)
    this.name = 'BackendError'
  }
}

/* Everything the app asks of storage and auth. The in-memory backend
   implements it for local development, Supabase in production; which
   one runs is chosen by `runtimeConfig.public.backend` (see
   plugins/backend.client.ts). */
export interface Backend {
  /** A ready-made account to log in with, offered on the login page.
   *  Only a backend where such an account exists provides one. */
  testAccount?: { email: string, password: string }

  /** The new user, signed in; or null when the account still has to be
   *  confirmed from an emailed link before it can sign in. */
  signUp(email: string, password: string): Promise<User | null>
  signIn(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  /** The signed-in user restored from the previous visit, if any. */
  currentUser(): Promise<User | null>

  loadProfile(userId: string): Promise<Profile | null>
  saveProfile(userId: string, profile: Profile): Promise<void>
  loadLinks(userId: string): Promise<Link[]>
  saveLinks(userId: string, links: Link[]): Promise<void>
  /** Stores the image and returns a URL that outlives the page. */
  uploadAvatar(userId: string, file: File): Promise<string>
}
