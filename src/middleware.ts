import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { AuthJWTPayload } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || '10xenglish-cms-ticket-super-secret-key-2026-production-ready'
);

const PUBLIC_PATHS = ['/login', '/api/upload'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua static files và public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Nếu đang ở trang login
  if (pathname === '/login') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const auth = payload as unknown as AuthJWTPayload;
        if (!auth.isPasswordChanged) {
          return NextResponse.redirect(new URL('/change-password', req.url));
        }
        return NextResponse.redirect(new URL('/', req.url));
      } catch {
        // Token lỗi -> Cho phép ở lại trang login
      }
    }
    return NextResponse.next();
  }

  // Nếu chưa đăng nhập mà vào route bảo vệ
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const auth = payload as unknown as AuthJWTPayload;

    // Nếu chưa đổi mật khẩu mặc định -> Ép vào trang đổi pass
    if (!auth.isPasswordChanged && pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', req.url));
    }

    // Nếu đã đổi mật khẩu mà vào lại /change-password
    if (auth.isPasswordChanged && pathname === '/change-password') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware JWT Verify Error:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
