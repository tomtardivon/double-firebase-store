import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedPath = path.startsWith('/account') || path.startsWith('/checkout');
  const isAuthPath = path.startsWith('/auth');
  
  // For now, we'll rely on client-side authentication checks
  // Server-side auth checking with Firebase requires more complex setup
  
  // Allow all requests to pass through
  // The pages themselves will handle authentication redirects
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/auth/:path*'],
};