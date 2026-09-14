export interface Toast {
  /** Changes with every `show`, so repeating a message restarts it. */
  id: number
  message: string
  /** Full literal icon name, so the icon scanner finds it. */
  icon: string
}

const DURATION_MS = 3000

let timer: ReturnType<typeof setTimeout> | undefined
let nextId = 0

/* One toast at a time, rendered by TheToast in app.vue. A new one
   replaces whatever is showing rather than queueing behind it: each
   confirms the action just taken, so an older one is already stale. */
export function useToast() {
  const toast = useState<Toast | null>('toast', () => null)

  function show(message: string, icon: string) {
    clearTimeout(timer)
    toast.value = { id: nextId++, message, icon }
    timer = setTimeout(() => { toast.value = null }, DURATION_MS)
  }

  return { toast, show }
}
