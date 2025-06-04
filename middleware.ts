import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🛡️ Middleware: Processing request for:', request.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Get session directly without retry to avoid interference
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🛡️ Middleware: Session check result:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      error: error?.message,
      path: request.nextUrl.pathname
    });

    // If there's no session and the user is trying to access a protected route
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('🛡️ Middleware: No session, redirecting to login');
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If there's a session and the user is on the login/register page, redirect to dashboard
    if (session && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register'))) {
      console.log('🛡️ Middleware: Has session, redirecting to dashboard');
      
      // Check if there's a redirectTo parameter
      const redirectTo = request.nextUrl.searchParams.get('redirectTo')
      const targetUrl = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'
      
      const redirectUrl = new URL(targetUrl, request.url)
      return NextResponse.redirect(redirectUrl)
    }
  } catch (err) {
    console.error('🛡️ Middleware: Error checking session:', err);
    // On error, allow the request to proceed rather than redirecting
    // This prevents infinite loops when there are authentication issues
  }

  console.log('🛡️ Middleware: Allowing request to proceed');
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 