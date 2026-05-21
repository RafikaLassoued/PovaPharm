function stripQuotes(value: string): string {
  return value.replace(/^['"](.*)['"]$/, '$1')
}

export function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return stripQuotes(value)
}

export function getOptionalEnvVar(name: string): string | undefined {
  const value = process.env[name]
  if (value === undefined) return undefined
  return stripQuotes(value)
}
