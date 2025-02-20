import useSettingsStore from '~/store/settings'

export default function usePluginsDeps() {
  const settings = useSettingsStore()
  const disabledPlugins = computed(() => getDisabledPlugins(settings.plugins))
  const registrationOrder = computed(() => getRegistrationOrder(settings.plugins))
  return {
    disabledPlugins,
    registrationOrder,
  }
}
