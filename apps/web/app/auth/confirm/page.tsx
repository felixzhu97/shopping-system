'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useUser } from '@/lib/store/userStore';

export default function AuthConfirmPage() {
  const router = useRouter();
  const user = useUser();
  const searchParams = useSearchParams();

  // 获取回调 URL
  const redirect = searchParams.get('redirect') || '/';

  // 如果已经登录，直接跳转到回调页面
  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  const handleLogin = () => {
    // 将当前的回调 URL 编码后传递给登录页面
    const encodedRedirect = encodeURIComponent(redirect);
    router.replace(`/login?redirect=${encodedRedirect}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-[580px] bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-blue-500"
          >
            <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
            <circle cx="16.5" cy="7.5" r=".5" />
          </svg>
          <h1 className="text-2xl font-medium mb-2">需要登录</h1>
          <p className="text-gray-500">该页面需要登录后才能访问。请登录您的账户或返回上一页。</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleLogin} className="w-full h-12" size="lg">
            登录
          </Button>
          <Button onClick={handleBack} variant="outline" className="w-full h-12" size="lg">
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  );
}
