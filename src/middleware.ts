import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'spj_session';
const secretKey = process.env.AUTH_SECRET || 'ganti-secret-ini-di-env';
const encodedKey = new TextEncoder().encode(secretKey);

const PUBLIC_PATHS = ['/login'];

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, encodedKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await isValidSession(token);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!valid && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (valid && isPublic) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
