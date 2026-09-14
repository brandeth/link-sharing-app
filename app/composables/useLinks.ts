export interface Link {
  /** Stable key for `v-for`; positions shift when a link is removed. */
  id: string
  platform: PlatformId
  url: string
}

/* A comparable fingerprint of the list. Built field by field rather
   than by stringifying the objects, so key order (which a backend is
   free to change) never reads as an edit. */
function snapshot(links: Link[]) {
  return JSON.stringify(links.map(({ id, platform, url }) => [id, platform, url]))
}

/* The user's links, shared by the editor on the Links page and the
   phone preview and Save button in the dashboard layout. Those are
   siblings rather than parent and child, so the list lives in
   `useState` instead of being passed down as props. */
export function useLinks() {
  const links = useState<Link[]>('links', () => [])

  /* Validation messages keyed by link id. Shared for the same reason as
     the list: Save in the layout raises them, the cards on the page show
     them. A link with no entry is valid, or has not been checked yet. */
  const errors = useState<Record<string, string>>('link-errors', () => ({}))

  /* The list as last saved or loaded, to tell whether there are edits
     that would be lost. */
  const saved = useState('links-saved', () => snapshot([]))
  const hasUnsavedChanges = computed(() => snapshot(links.value) !== saved.value)

  /* Taken while the Nuxt context is available; `save` uses it after an
     `await`, where the context is gone. */
  const { $backend: backend } = useNuxtApp()

  function add() {
    /* A new link starts on the first platform not already in the list,
       so adding several in a row does not produce a stack of duplicate
       GitHub links to re-pick. Once every platform is used it falls back
       to the first. */
    const used = new Set(links.value.map(link => link.platform))
    const platform = PLATFORMS.find(p => !used.has(p.id)) ?? PLATFORMS[0]

    links.value.push({ id: crypto.randomUUID(), platform: platform.id, url: '' })
  }

  function remove(id: string) {
    links.value = links.value.filter(link => link.id !== id)
    clearError(id)
  }

  /* Checks every link and records a message for each one that fails.
     Returns whether the whole list is valid, so the caller can stop the
     save. Messages are only raised here, never while typing — see
     `clearError`. */
  function validate(): boolean {
    const next: Record<string, string> = {}

    for (const link of links.value) {
      if (!link.url.trim()) {
        next[link.id] = 'Can\'t be empty'
        continue
      }

      /* A valid link is written back in full, so `github.com/john`
         becomes `https://github.com/john` before it is saved: stored
         bare, the preview would resolve it as a path on this site. */
      const url = toPlatformUrl(link.platform, link.url)
      if (url) link.url = url
      else next[link.id] = 'Please check the URL'
    }

    errors.value = next
    return Object.keys(next).length === 0
  }

  /* Called when a link is edited. As on the login form, the message goes
     away as soon as the user starts fixing it and is only re-checked on
     the next save, so a half-typed URL never flashes red. */
  function clearError(id: string) {
    if (!(id in errors.value)) return
    const { [id]: _removed, ...rest } = errors.value
    errors.value = rest
  }

  /* Validates, then stores the list. Returns false when validation
     fails, leaving the messages on the cards; backend failures throw. */
  async function save(userId: string) {
    if (!validate()) return false
    await backend.saveLinks(userId, links.value)
    saved.value = snapshot(links.value)
    return true
  }

  async function load(userId: string) {
    links.value = await backend.loadLinks(userId)
    saved.value = snapshot(links.value)
    errors.value = {}
  }

  function reset() {
    links.value = []
    saved.value = snapshot([])
    errors.value = {}
  }

  return { links, hasUnsavedChanges, errors, add, remove, validate, clearError, save, load, reset }
}
