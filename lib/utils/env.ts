const getEnvVariable = (key: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env[key] || ''
  }
  // Server-side
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  features: {
    enableQuickWins: process.env.NEXT_PUBLIC_ENABLE_QUICK_WINS !== 'false',
    enableStrategyMap: process.env.NEXT_PUBLIC_ENABLE_STRATEGY_MAP !== 'false',
    enableAcademy: process.env.NEXT_PUBLIC_ENABLE_ACADEMY !== 'false',
  },
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },
} as const

export const validateEnv = () => {
  if (typeof window !== 'undefined') return // Skip validation on client-side

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  }
} 