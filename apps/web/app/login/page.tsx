'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/lib/stores/user-store';

import { login, register } from '@/lib/api/users';

function LoginContent() {
  // 登录相关
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // 订单查找相关
  const [orderNumber, setOrderNumber] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  const setToken = useUserStore(state => state.setToken);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // 登录处理
  const handleLogin = async () => {
    setLoading(true);
    setLoginError('');
    try {
      const token = await login(email, password);
      setToken(token);
      router.replace(redirect);
    } catch (e: any) {
      // 自动注册再登录
      try {
        const token = await register(email, password);
        setToken(token);
        router.replace(redirect);
      } catch (regErr: any) {
        setLoginError(regErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 订单查找处理（仅做前端演示，实际可对接API）
  const handleOrderLookup = () => {
    setOrderLoading(true);
    setOrderError('');
    setTimeout(() => {
      if (!orderNumber || !orderEmail) {
        setOrderError('请输入订单号和邮箱');
      } else {
        setOrderError('未找到相关订单（演示）');
      }
      setOrderLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航占位 */}
      <div className="h-12" />
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold mb-10 mt-4">Find your order.</h1>
        <div className="flex w-full max-w-4xl bg-white rounded-xl shadow divide-x divide-gray-200">
          {/* 左侧：账号登录 */}
          <div className="flex-1 p-10 flex flex-col items-center">
            <h2 className="text-lg font-medium mb-6">Sign in with your Account.</h2>
            <div className="w-full max-w-xs">
              <input
                className="w-full border rounded px-4 py-3 mb-4 text-base"
                placeholder="Email or Phone Number"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
              <input
                className="w-full border rounded px-4 py-3 mb-2 text-base"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <div className="flex items-center mb-4">
                <input
                  id="remember"
                  type="checkbox"
                  className="mr-2"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <label htmlFor="remember" className="text-sm">
                  Remember me
                </label>
              </div>
              {loginError && <div className="text-red-500 mb-2 text-sm">{loginError}</div>}
              <button
                className="w-full bg-black text-white rounded py-3 text-base font-medium mb-2"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>
              <div className="text-center">
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>
          </div>
          {/* 右侧：订单查找 */}
          <div className="flex-1 p-10 flex flex-col items-center">
            <h2 className="text-lg font-medium mb-2">Look it up with your order number.</h2>
            <div className="text-sm text-gray-600 mb-4">Find an individual order.</div>
            <div className="w-full max-w-xs">
              <input
                className="w-full border rounded px-4 py-3 mb-2 text-base"
                placeholder="Order number"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
              />
              <input
                className="w-full border rounded px-4 py-3 mb-4 text-base"
                placeholder="Email address"
                value={orderEmail}
                onChange={e => setOrderEmail(e.target.value)}
              />
              {orderError && <div className="text-red-500 mb-2 text-sm">{orderError}</div>}
              <button
                className="w-full bg-blue-600 text-white rounded py-3 text-base font-medium mb-2"
                onClick={handleOrderLookup}
                disabled={orderLoading}
              >
                {orderLoading ? 'Searching...' : 'Continue'}
              </button>
              <div className="text-center text-xs text-gray-500 mb-1">
                How to find your order number{' '}
                <span className="text-blue-600 cursor-pointer">ⓘ</span>
              </div>
              <div className="text-center text-xs">
                Returning a gift?{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Start by finding the order number
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* 底部版权等 */}
      <footer className="text-xs text-gray-500 text-center py-6 mt-10">
        Copyright © {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
