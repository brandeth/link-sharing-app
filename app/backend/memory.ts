import type { Link } from '~/composables/useLinks'
import type { Profile } from '~/composables/useProfile'
import { BackendError, type Backend, type User } from './types'

/* The local development backend. Everything lives in one plain object
   that is mirrored to `sessionStorage`, so a refresh keeps the account,
   the session and the saved data, while closing the tab starts clean.

   Development only: passwords are stored as typed, and nothing is
   shared between tabs or browsers. */

interface StoredUser extends User {
  password: string
}

interface Database {
  users: StoredUser[]
  profiles: Record<string, Profile>
  links: Record<string, Link[]>
  sessionUserId: string | null
}

const STORAGE_KEY = 'link-sharing-app:memory-backend'

/* Seeded so there is always an account to log in with, even straight
   after the tab's storage has been cleared. */
const DEV_USER = { email: 'dev@example.com', password: 'password' }

function seed(): Database {
  return {
    users: [{ id: 'dev-user', ...DEV_USER }],
    profiles: {},
    links: {},
    sessionUserId: null,
  }
}

function load(): Database {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  }
  catch {
    // Unreadable or blocked storage: start from the seed.
  }
  return seed()
}

const db = load()

/* A large avatar can push the data past the storage quota. The write is
   then skipped rather than failing the save: the data is still held in
   memory, it just will not survive a refresh. */
function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }
  catch (error) {
    console.warn('[memory backend] Could not persist to sessionStorage:', error)
  }
}

/* Copies on the way in and out, so later edits to the app's reactive
   state cannot reach into "saved" data, as they could not with a real
   database. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function toUser({ id, email }: StoredUser): User {
  return { id, email }
}

function findUser(email: string) {
  const wanted = email.trim().toLowerCase()
  return db.users.find(user => user.email.toLowerCase() === wanted)
}

/* Blob URLs die with the page, so the image is kept as a data URL. */
function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export const memoryBackend: Backend = {
  testAccount: DEV_USER,

  async signUp(email, password) {
    if (findUser(email)) throw new BackendError('email-taken')

    const user: StoredUser = { id: crypto.randomUUID(), email: email.trim(), password }
    db.users.push(user)
    db.sessionUserId = user.id
    persist()
    return toUser(user)
  },

  async signIn(email, password) {
    const user = findUser(email)
    if (!user || user.password !== password) throw new BackendError('invalid-credentials')

    db.sessionUserId = user.id
    persist()
    return toUser(user)
  },

  async signOut() {
    db.sessionUserId = null
    persist()
  },

  async currentUser() {
    const user = db.users.find(({ id }) => id === db.sessionUserId)
    return user ? toUser(user) : null
  },

  async loadProfile(userId) {
    const profile = db.profiles[userId]
    return profile ? clone(profile) : null
  },

  async saveProfile(userId, profile) {
    db.profiles[userId] = clone(profile)
    persist()
  },

  async loadLinks(userId) {
    return clone(db.links[userId] ?? [])
  },

  async saveLinks(userId, links) {
    db.links[userId] = clone(links)
    persist()
  },

  async uploadAvatar(_userId, file) {
    return readAsDataUrl(file)
  },
}
