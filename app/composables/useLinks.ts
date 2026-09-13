export interface Link {
  /** Stable key for `v-for`; positions shift when a link is removed. */
  id: string
  platform: PlatformId
  url: string
}

/* The user's links, shared by the editor on the Links page and the
   phone preview and Save button in the dashboard layout. Those are
   siblings rather than parent and child, so the list lives in
   `useState` instead of being passed down as props. */
export function useLinks() {
  const links = useState<Link[]>('links', () => [])

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
  }

  return { links, add, remove }
}
