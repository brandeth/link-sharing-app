/* For login and signup: someone already signed in goes to the editor. */
export default defineNuxtRouteMiddleware(async () => {
  const { user, restore } = useSession()
  await restore()
  if (user.value) return navigateTo('/links')
})
