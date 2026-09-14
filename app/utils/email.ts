/* Deliberately loose: something, an @, something, a dot, something. It
   catches the typos a form can reasonably catch (a missing @ or domain)
   without rejecting real addresses a stricter pattern gets wrong. Shared
   by login, signup and the profile form so all three agree. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
