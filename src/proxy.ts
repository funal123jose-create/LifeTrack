import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { publicEnv } from "@/lib/env/public"

const PRIVATE_ROUTES = ['/dashboard', '/pilares', '/portafolio', '/historial', '/calendario']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getClaims()

  // Validate private dashboard and pillar routes with signed auth claims.
  const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  )

  if ((!data?.claims || error) && isPrivateRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/pilares',
    '/pilares/:path*',
    '/portafolio',
    '/portafolio/:path*',
    '/historial',
    '/historial/:path*',
    '/calendario',
    '/calendario/:path*',
  ],
}
