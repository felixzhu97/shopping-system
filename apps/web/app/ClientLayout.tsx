'use client';

import { ReactNode, useEffect, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from 'next/navigation';
import { useToken } from '@/lib/store/userStore';

const PROTECTED_PATHS = [
  '/account', // 账户页
];

function isProtectedPath(path: string) {
  // 允许 /products/xxx 详情页
  if (path.startsWith('/orders') || path.startsWith('/checkout')) return true;
  return PROTECTED_PATHS.includes(path);
}

function ProtectedContent({ children }: { children: ReactNode }) {
  const token = useToken();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token && isProtectedPath(pathname) && pathname !== '/auth/confirm') {
      console.log('redirect to login');
      router.replace(`/auth/confirm?redirect=${encodeURIComponent(pathname)}`);
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
