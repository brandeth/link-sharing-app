/* The platforms a link can point at, in the order the dropdown lists
   them.

   Icons come from teenyicons where it has the brand, which is the set
   the design draws from, and simple-icons for the five it lacks. Every
   name is written out as a full literal so the icon scanner finds it —
   see `clientBundle` in nuxt.config.ts.

   `color` is each platform's fill in the phone preview. These are the
   platforms' own brand colours, not part of the app's palette, so they
   live here as data rather than as design tokens.

   `hosts` is what "Please check the URL" checks a link against. */

export interface Platform {
  id: string
  label: string
  icon: string
  color: string
  /** Domains a link for this platform may point at. Subdomains count,
   *  so `github.com` also admits `www.github.com`. */
  hosts: readonly string[]
  /** A light fill needs dark text and a border to read as a button. */
  light?: boolean
}

export const PLATFORMS = [
  { id: 'github', label: 'GitHub', icon: 'teenyicons:github-solid', color: '#1A1A1A', hosts: ['github.com'] },
  { id: 'frontend-mentor', label: 'Frontend Mentor', icon: 'simple-icons:frontendmentor', color: '#FFFFFF', light: true, hosts: ['frontendmentor.io'] },
  { id: 'twitter', label: 'Twitter', icon: 'teenyicons:twitter-solid', color: '#43B7E9', hosts: ['twitter.com', 'x.com'] },
  { id: 'linkedin', label: 'LinkedIn', icon: 'teenyicons:linkedin-solid', color: '#2D68FF', hosts: ['linkedin.com'] },
  { id: 'youtube', label: 'YouTube', icon: 'teenyicons:youtube-solid', color: '#EE3939', hosts: ['youtube.com', 'youtu.be'] },
  { id: 'facebook', label: 'Facebook', icon: 'teenyicons:facebook-solid', color: '#2442AC', hosts: ['facebook.com', 'fb.com'] },
  { id: 'twitch', label: 'Twitch', icon: 'teenyicons:twitch-solid', color: '#EE3FC8', hosts: ['twitch.tv'] },
  { id: 'devto', label: 'Dev.to', icon: 'simple-icons:devdotto', color: '#333333', hosts: ['dev.to'] },
  { id: 'codewars', label: 'Codewars', icon: 'simple-icons:codewars', color: '#8A1A50', hosts: ['codewars.com'] },
  { id: 'codepen', label: 'Codepen', icon: 'teenyicons:codepen-solid', color: '#1A1A1A', hosts: ['codepen.io'] },
  { id: 'freecodecamp', label: 'freeCodeCamp', icon: 'simple-icons:freecodecamp', color: '#302267', hosts: ['freecodecamp.org'] },
  { id: 'gitlab', label: 'GitLab', icon: 'teenyicons:gitlab-solid', color: '#EB4925', hosts: ['gitlab.com'] },
  { id: 'hashnode', label: 'Hashnode', icon: 'simple-icons:hashnode', color: '#0330D1', hosts: ['hashnode.com', 'hashnode.dev'] },
  { id: 'stack-overflow', label: 'Stack Overflow', icon: 'teenyicons:stackoverflow-solid', color: '#EC7100', hosts: ['stackoverflow.com'] },
] as const satisfies readonly Platform[]

export type PlatformId = (typeof PLATFORMS)[number]['id']

export function getPlatform(id: PlatformId): Platform {
  return PLATFORMS.find(platform => platform.id === id)!
}

/* Anything that does not open with a `scheme://` is taken to be missing
   one, so `github.com/john`, `www.github.com/john` and a pasted
   `https://github.com/john` all work. Only `://` counts as a scheme:
   `javascript:alert(1)` has none by this rule, so it becomes
   `https://javascript:alert(1)` and fails as a malformed host. */
const SCHEME_RE = /^[a-z][a-z\d+.-]*:\/\//i

/* Returns the link as a full URL when it is valid for the platform, or
   null when it is not. Valid means it parses as an http(s) URL whose
   host is one of the platform's domains or a subdomain of one. Matching
   whole labels, not a substring, is what stops `github.com.evil.io` or
   `notgithub.com` passing as GitHub. `URL` also rejects malformed hosts
   outright, e.g. `www.youtube:com`. */
export function toPlatformUrl(id: PlatformId, value: string): string | null {
  const trimmed = value.trim()
  let url: URL
  try {
    url = new URL(SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`)
  }
  catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase()
  const allowed = getPlatform(id).hosts.some(domain => host === domain || host.endsWith(`.${domain}`))
  return allowed ? url.href : null
}
