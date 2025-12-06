import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /grade/6, /grade/7, etc.)
  const path = request.nextUrl.pathname

  // Check if this is a grade-specific route
  const gradeMatch = path.match(/^\/grade\/(\d+)/)
  
  if (gradeMatch) {
    const requestedGrade = parseInt(gradeMatch[1])
    
    // Get user info from cookies/headers (you'll need to implement this based on your auth system)
    // For now, we'll let the component-level guards handle the access control
    // This middleware can be extended later for server-side checks
    
    // Allow the request to proceed - component guards will handle access control
    return NextResponse.next()
  }

  // For non-grade routes, allow access
  return NextResponse.next()
}

export const config = {
  // Match all grade routes and their sub-routes
  matcher: [
    '/grade/:path*',
    '/level/:path*'
  ]
}