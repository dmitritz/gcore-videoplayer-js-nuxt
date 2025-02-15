import type { PlayerDebugTag } from "@gcorevideo/player";

export function parseChoice<T>(value: string | null, choices: T[], defaultValue: T): T {
  return choices.includes(value as unknown as T) ? value as unknown as T : defaultValue;
}

export function isValidDebugTag(tag: string): tag is PlayerDebugTag {
  return ['all', 'clappr', 'dash', 'hls', 'none'].includes(tag);
}
