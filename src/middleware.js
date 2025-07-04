import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_FILE = /\\.(.*)$/;

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internal paths and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') || // We will protect API routes individually
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // Redirect root path to login or dashboard
  if (pathname === '/') {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Invalid token, redirect to login and clear cookie
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
    // No token, go to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/verify-email');

  if (isAuthPage) {
    if (token) {
      // If user is logged in, redirect from auth pages to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If not logged in and on an auth page, allow access
    return NextResponse.next();
  }

  if (!token) {
    // If no token and not on an auth page, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token for protected routes
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    // Token is valid, allow access
    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    // If token is invalid, redirect to login and clear the invalid cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
