import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

async function verifyAdminSession(request: NextRequest): Promise<{ adminId: string; email: string } | null> {
  try {
    const token = request.cookies.get('admin_session')?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!')
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
    // Return response without Supabase client to prevent crash
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Enhance cookie security
            const secureOptions = {
              ...options,
              httpOnly: options?.httpOnly ?? true,
              secure: process.env.NODE_ENV === 'production' ? (options?.secure ?? true) : false,
              sameSite: (options?.sameSite as 'strict' | 'lax' | 'none') ?? 'lax',
              path: options?.path ?? '/',
            }
            supabaseResponse.cookies.set(name, value, secureOptions)
          })
        },
      },
    }
  )

  // Check if accessing dashboard route
  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname.startsWith('/dashbord')
  const isLoginRoute = pathname.startsWith('/login')
  const isApiRoute = pathname.startsWith('/api')

  // Protect dashboard routes
  if (isDashboardRoute && !isApiRoute) {
    const session = await verifyAdminSession(request)
    
    if (!session) {
      // No session - redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }

    // Verify admin exists in database
    const { data: admin } = await supabase
      .from('admin')
      .select('id, email')
      .eq('id', session.adminId)
      .eq('email', session.email)
      .maybeSingle()

    if (!admin) {
      // Admin doesn't exist or mismatch - redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname)
      url.searchParams.set('error', 'no_access')
      return NextResponse.redirect(url)
    }
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (isLoginRoute) {
    const session = await verifyAdminSession(request)
    if (session) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashbord/@65@&@/alilou_kermiche'
      url.searchParams.delete('next')
      url.searchParams.delete('error')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
