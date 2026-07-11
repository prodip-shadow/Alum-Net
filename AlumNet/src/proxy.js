import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Role → dashboard route mapping
const ROLE_DASHBOARD = {
  admin: '/dashboard/admin',
  student: '/dashboard/student',
  alumni: '/dashboard/alumni',
};

// Role-restricted routes: only the matching role can access
const ROLE_ROUTES = ['/dashboard/admin', '/dashboard/student', '/dashboard/alumni'];

export async function proxy(req) {
  const token = await getToken({ req });
  const reqPath = req.nextUrl.pathname;
  const isAuthenticated = Boolean(token);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', reqPath);
    return NextResponse.redirect(loginUrl);
  }

  const role = token?.role;
  const allowedDashboard = ROLE_DASHBOARD[role];

  // If user visits exactly /dashboard, redirect to their role dashboard
  if (reqPath === '/dashboard' || reqPath === '/dashboard/') {
    const redirectUrl = new URL(allowedDashboard || '/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if the user is trying to access a role-restricted route
  const isRoleRoute = ROLE_ROUTES.some(route => reqPath.startsWith(route));

  if (isRoleRoute) {
    // If the user doesn't have an allowed dashboard or the path doesn't start with their dashboard
    if (!allowedDashboard || !reqPath.startsWith(allowedDashboard)) {
      // Redirect to their correct dashboard, or home if role unknown
      const redirectUrl = new URL(allowedDashboard || '/', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};

