import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要添加CORS支持的路径
const CORS_PATHS = [
  '/api/products',
  '/api/products/',
  '/api/cart',
  '/api/cart/',
  '/api/auth',
  '/api/auth/',
  '/api/orders',
  '/api/orders/',
];

// 需要登录才能访问的路由
const protectedRoutes = ['/account', '/orders', '/cart', '/checkout', '/wishlist', '/settings'];

// 判断请求路径是否需要CORS
function shouldApplyCors(path: string): boolean {
  return CORS_PATHS.some(corsPath => path === corsPath || path.startsWith(`${corsPath}/`));
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('user-store')?.value;
  const pathname = request.nextUrl.pathname;

  // 检查是否是需要保护的路由
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // 构建回调 URL
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);

    // 重定向到登录确认页面
    const redirectUrl = new URL(`/auth/confirm?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 不为API路由添加CORS
  if (!shouldApplyCors(pathname)) {
    return NextResponse.next();
  }

  // 预检处理
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  // 为API响应添加CORS头
  const response = NextResponse.next();
  return addCorsHeaders(response);
}

// 处理预检OPTIONS请求
function handleOptionsRequest() {
  const response = new NextResponse(null, { status: 204 }); // No content
  return addCorsHeaders(response);
}

// 添加CORS头部
function addCorsHeaders(response: NextResponse) {
  // 允许所有来源访问
  response.headers.set('Access-Control-Allow-Origin', '*');
  // 允许的HTTP方法
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 缓存CORS预检结果
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// 配置中间件在哪些路径上执行
export const config = {
  matcher: [
    /*
     * 匹配所有API路由:
     * - /api/products
     * - /api/products/[productId]
     * - /api/cart
     * 等等
     */
    '/api/:path*',
  ],
};
