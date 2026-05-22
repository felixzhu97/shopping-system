'use client';

import { initDatadogRUM } from 'monitoring/client';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, Suspense, useState } from 'react';

import Loading from '@/components/Loading';
import { Toaster } from '@/components/ui/toaster';
import { useToken } from '@/lib/store/userStore';


// 只在客户端导入 i18n
import '../i18n';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isProtectedPath(pathname) && !token) {
      setLoading(true);
      router.replace(`/auth/confirm?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setLoading(false);
    }
  }, [token, pathname, router]);

  return loading ? <Loading /> : <>{children}</>;
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  // Initialize Datadog RUM on client side
  useEffect(() => {
    initDatadogRUM();
  }, []);

  return (
    <>
      <Suspense fallback={<Loading />}>
        <ProtectedContent>{children}</ProtectedContent>
      </Suspense>
      <Toaster />
    </>
  );
}
