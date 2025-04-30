'use client';

import { ReactNode, useEffect, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/store/userStore';

const PUBLIC_PATHS = [
  '/', // 首页
  '/products', // 商品列表
  '/login', // 登录页
  '/register', // 注册页
  '/cart', // 购物车页
  // '/checkout', // 结算页
  // '/checkout/success', // 结算成功页
  // '/checkout/failure', // 结算失败页
  // '/checkout/cancel', // 结算取消页
];

function isPublicPath(path: string) {
  // 允许 /products/xxx 详情页
  if (path === '/' || path.startsWith('/products')) return true;
  return PUBLIC_PATHS.includes(path);
}

function ProtectedContent({ children }: { children: ReactNode }) {
  const token = getToken();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token && !isPublicPath(pathname) && pathname !== '/login') {
      console.log('redirect to login');
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [token, pathname, router]);

  return children;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ProtectedContent>{children}</ProtectedContent>
      </Suspense>
      <Toaster />
    </>
  );
}
