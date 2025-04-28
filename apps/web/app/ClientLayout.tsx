'use client';

import { ReactNode, useEffect } from 'react';
import { useUserStore } from '@/lib/stores/user-store';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATHS = [
  '/', // 首页
  '/products', // 商品列表
];

function isPublicPath(path: string) {
  // 允许 /products/xxx 详情页
  if (path === '/' || path.startsWith('/products')) return true;
  return PUBLIC_PATHS.includes(path);
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const token = useUserStore(state => state.token);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token && !isPublicPath(pathname) && pathname !== '/login') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [token, pathname, router]);

  return (
    <>
      {/* 未登录且非公开页面时，不渲染内容 */}
      {!token && !isPublicPath(pathname) && pathname !== '/login' ? null : children}
      <Toaster />
    </>
  );
}
