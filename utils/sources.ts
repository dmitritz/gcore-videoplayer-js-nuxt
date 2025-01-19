export function parseSources(rawSources: string): string[] {
  return rawSources
    .split('\n')
    .map((source) => source.trim())
    .filter(s => s.length > 0)
}
