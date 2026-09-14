/* For pages that need an account: anyone signed out goes to login. */
export default defineNuxtRouteMiddleware(async () => {
  const { user, restore } = useSession()
  await restore()
  if (!user.value) return navigateTo('/login')
})
