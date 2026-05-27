import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Protect all /admin/* routes except the login page
export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      // Require a valid JWT for all /admin/* routes
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/admin/:path*'],
}
