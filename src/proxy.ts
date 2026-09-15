import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/core/config/env';
import { verifyJWT } from '@/core/auth/jwt';

const LOGIN_PATH = '/login';
const CHANGE_PASSWORD_PATH = '/change-password';

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  );
}

function redirect(req: NextRequest, path: string, clearSession = false) {
  const response = NextResponse.redirect(new URL(path, req.url));
  if (clearSession) response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

/**
 * Cổng chặn duy nhất của ứng dụng (Next 16: proxy thay cho middleware):
 * - chưa đăng nhập -> /login
 * - còn mật khẩu mặc định -> /change-password
 * - token sai/hết hạn -> xoá cookie, về /login
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isStaticAsset(pathname)) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const auth = token ? await verifyJWT(token) : null;

  if (pathname === LOGIN_PATH) {
    if (!token) return NextResponse.next();
    if (!auth) {
      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
    return redirect(req, auth.isPasswordChanged ? '/' : CHANGE_PASSWORD_PATH);
  }

  if (!token) return redirect(req, LOGIN_PATH);
  if (!auth) return redirect(req, LOGIN_PATH, true);

  if (!auth.isPasswordChanged && pathname !== CHANGE_PASSWORD_PATH) {
    return redirect(req, CHANGE_PASSWORD_PATH);
  }
  if (auth.isPasswordChanged && pathname === CHANGE_PASSWORD_PATH) {
    return redirect(req, '/');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
