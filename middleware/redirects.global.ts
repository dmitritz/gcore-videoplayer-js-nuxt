export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/arbitrary-source') {
    return navigateTo('/source')
  }
})
