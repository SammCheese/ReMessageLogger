import { settings } from "replugged";

export let MLSettings: settings.SettingsManager<{
  useOverlay: boolean;
  ignoreBots: boolean;
  ignoreSelf: boolean;
}, never>;

export async function initSettings(): Promise<void> {
  MLSettings = await settings.init("messagelogger", {
    useOverlay: false,
    ignoreBots: false,
    ignoreSelf: false
  })
}
