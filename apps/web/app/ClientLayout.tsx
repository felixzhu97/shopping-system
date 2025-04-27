'use client';

import { ReactNode, useState, useEffect } from 'react';
import LoginModal from '@/components/LoginModal';
import { useUserStore } from '@/lib/user-store';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';

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
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!token && !isPublicPath(pathname)) {
      setLoginOpen(true);
    }
  }, [token, pathname]);

  return (
    <>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      {/* 未登录且非公开页面时，不渲染内容 */}
      {!token && !isPublicPath(pathname) ? null : children}
      <Toaster />
    </>
  );
}
