export function parseChoice<T>(value: string | null, choices: T[], defaultValue: T): T {
  return choices.includes(value as unknown as T) ? value as unknown as T : defaultValue;
}
