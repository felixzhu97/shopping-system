'use client';

import { ReactNode, useEffect, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/utils/user';

const PUBLIC_PATHS = [
  '/', // 首页
  '/products', // 商品列表
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
