type SnippetProps = Record<string, unknown>

export interface SnippetOptions {
  /** Component tag name, e.g. `BaseButton`. */
  name: string
  /** Props the component is rendered with. */
  props?: SnippetProps
  /** Prop defaults; anything matching is omitted so the snippet stays idiomatic. */
  defaults?: SnippetProps
  /** Default-slot text content. Omitted renders a self-closing tag. */
  slot?: string
  /** Width at which attributes break onto their own lines. Defaults to a
   *  width that fits a two-column specimen grid without scrolling. */
  maxLineLength?: number
}

function formatAttribute(key: string, value: unknown): string {
  if (value === true) return key
  if (typeof value === 'string') return `${key}="${value}"`
  return `:${key}="${String(value)}"`
}

/**
 * Prints the markup that produces a given render.
 *
 * The showcase renders from the same `props`/`slot` this reads, so a
 * specimen and its snippet cannot drift apart — there is only one source.
 */
export function toSnippet(options: SnippetOptions): string {
  const { name, props = {}, defaults = {}, slot, maxLineLength = 46 } = options

  const attributes = Object.entries(props)
    .filter(([key, value]) => value !== undefined && value !== defaults[key])
    .map(([key, value]) => formatAttribute(key, value))

  const open = attributes.length ? `<${name} ${attributes.join(' ')}` : `<${name}`
  const singleLine = slot === undefined ? `${open} />` : `${open}>${slot}</${name}>`

  if (singleLine.length <= maxLineLength || attributes.length === 0) return singleLine

  const lines = [`<${name}`, ...attributes.map((attribute) => `  ${attribute}`)]
  return slot === undefined
    ? [...lines, '/>'].join('\n')
    : [...lines, '>', `  ${slot}`, `</${name}>`].join('\n')
}
