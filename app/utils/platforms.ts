/* The platforms a link can point at, in the order the dropdown lists
   them.

   Icons come from teenyicons where it has the brand, which is the set
   the design draws from, and simple-icons for the five it lacks. Every
   name is written out as a full literal so the icon scanner finds it —
   see `clientBundle` in nuxt.config.ts.

   `color` is each platform's fill in the phone preview. These are the
   platforms' own brand colours, not part of the app's palette, so they
   live here as data rather than as design tokens. */

export interface Platform {
  id: string
  label: string
  icon: string
  color: string
  /** A light fill needs dark text and a border to read as a button. */
  light?: boolean
}

export const PLATFORMS = [
  { id: 'github', label: 'GitHub', icon: 'teenyicons:github-solid', color: '#1A1A1A' },
  { id: 'frontend-mentor', label: 'Frontend Mentor', icon: 'simple-icons:frontendmentor', color: '#FFFFFF', light: true },
  { id: 'twitter', label: 'Twitter', icon: 'teenyicons:twitter-solid', color: '#43B7E9' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'teenyicons:linkedin-solid', color: '#2D68FF' },
  { id: 'youtube', label: 'YouTube', icon: 'teenyicons:youtube-solid', color: '#EE3939' },
  { id: 'facebook', label: 'Facebook', icon: 'teenyicons:facebook-solid', color: '#2442AC' },
  { id: 'twitch', label: 'Twitch', icon: 'teenyicons:twitch-solid', color: '#EE3FC8' },
  { id: 'devto', label: 'Dev.to', icon: 'simple-icons:devdotto', color: '#333333' },
  { id: 'codewars', label: 'Codewars', icon: 'simple-icons:codewars', color: '#8A1A50' },
  { id: 'codepen', label: 'Codepen', icon: 'teenyicons:codepen-solid', color: '#1A1A1A' },
  { id: 'freecodecamp', label: 'freeCodeCamp', icon: 'simple-icons:freecodecamp', color: '#302267' },
  { id: 'gitlab', label: 'GitLab', icon: 'teenyicons:gitlab-solid', color: '#EB4925' },
  { id: 'hashnode', label: 'Hashnode', icon: 'simple-icons:hashnode', color: '#0330D1' },
  { id: 'stack-overflow', label: 'Stack Overflow', icon: 'teenyicons:stackoverflow-solid', color: '#EC7100' },
] as const satisfies readonly Platform[]

export type PlatformId = (typeof PLATFORMS)[number]['id']

export function getPlatform(id: PlatformId): Platform {
  return PLATFORMS.find(platform => platform.id === id)!
}
