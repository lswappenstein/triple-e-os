import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env, validateEnv } from '@/lib/utils/env'

// Validate environment variables
validateEnv()

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  )
} 