'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/lib/user-store';
import { login, register } from '@/lib/api/auth';

function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < 8; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${name}@example.com`;
}

function generateStrongPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '!@#$%^&*()_+-=';
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  const all = upper + lower + nums + special;
  for (let i = 0; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd;
}

export default function LoginPage() {
  const [email, setEmail] = useState(generateRandomEmail());
  const [password, setPassword] = useState(generateStrongPassword());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setToken = useUserStore(state => state.setToken);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLogin = async () => {
    setLoading(true);
    setError('');
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
        setError(regErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl p-8 w-full max-w-sm shadow">
        <h2 className="text-xl font-bold mb-4">用户登录</h2>
        <input
          className="w-full border rounded p-2 mb-2"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2 mb-2"
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          className="w-full bg-blue-600 text-white rounded p-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录 / 自动注册'}
        </button>
      </div>
    </div>
  );
}
