'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { login } from '@/lib/api/users';
import { saveToken } from '@/lib/utils/users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('请输入邮箱或手机号码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);

      saveToken(user);

      router.push('/'); // 登录成功后跳转到首页
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 py-16 bg-[#f5f5f7]">
        <div className="w-full max-w-[580px] mx-auto">
          <h1 className="text-[40px] font-medium text-center mb-2">登录快捷结账</h1>

          <div className="bg-white rounded-2xl p-8 mt-8 shadow-sm">
            <h2 className="text-2xl font-medium mb-6 text-center">登录购物系统</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="邮箱或手机号码"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 absolute right-2 top-2 p-0 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                  ) : (
                    '→'
                  )}
                </Button>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" disabled={loading} />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  记住我
                </label>
              </div>

              <div className="space-y-2 text-sm text-blue-600">
                <Link href="/forgot-password" className="block hover:underline">
                  忘记密码？
                </Link>
                <Link href="/register" className="block hover:underline">
                  创建账户 →
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-4">
              本网上商店使用行业标准的加密方式来保护您提交的信息的机密性。 了解更多关于我们的{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                隐私政策
              </Link>
              。
            </p>
            <p>
              需要帮助？联系{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                在线客服
              </Link>{' '}
              或致电 400-666-8800。
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
