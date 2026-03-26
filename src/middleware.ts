import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a la página de login
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Proteger todas las rutas /admin
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('session')?.value;

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(session, encodedKey, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
