'use client';

import { useState, useCallback, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { login } from '@/lib/api/users';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { saveToken } from '@/lib/store/userStore';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

// 骨架屏组件
const LoginFormSkeleton = () => (
  <div className="w-full max-w-[580px] mx-auto animate-pulse">
    <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-2" />
    <div className="bg-white rounded-2xl p-8 mt-8 shadow-sm">
      <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto mb-6" />
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-gray-200 rounded-lg" />
        <div className="h-5 w-32 bg-gray-200 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded-lg" />
          <div className="h-4 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// 登录表单组件
const LoginForm = ({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <div className="w-full max-w-[580px] mx-auto">
    <h1 className="text-[40px] font-medium text-center mb-2">登录快捷结账</h1>

    <div className="bg-white rounded-2xl p-8 mt-8 shadow-sm">
      <h2 className="text-2xl font-medium mb-6 text-center">登录购物系统</h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="relative">
          <Input
            type="email"
            placeholder="邮箱或手机号码"
            value={email}
            onChange={onEmailChange}
            className="h-12 px-4 text-base"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={onPasswordChange}
            className="h-12 px-4 text-base"
            disabled={loading}
            autoComplete="current-password"
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
          <Link href="/reset-password" className="block hover:underline">
            忘记密码？
          </Link>
          <Link href="/register" prefetch className="block hover:underline">
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
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // 使用防抖处理输入
  const debouncedEmail = useDebounce(email, 300);
  const debouncedPassword = useDebounce(password, 300);

  // 表单验证
  const validateForm = useCallback(() => {
    if (!debouncedEmail) {
      setError('请输入邮箱');
      return false;
    }
    if (!debouncedEmail.includes('@')) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    if (!debouncedPassword) {
      setError('请输入密码');
      return false;
    }
    if (debouncedPassword.length < 6) {
      setError('密码长度不能小于6位');
      return false;
    }
    return true;
  }, [debouncedEmail, debouncedPassword]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast({
          title: '表单验证失败',
          description: '请检查并修正表单中的错误',
          variant: 'destructive',
          duration: 3000,
        });
        return;
      }

      setLoading(true);
      setError('');

      try {
        const user = await login(debouncedEmail, debouncedPassword);

        toast({
          title: '登录成功',
          description: '欢迎回来！',
          duration: 3000,
        });

        // 预加载首页
        router.prefetch('/');

        // 先保存用户信息，再跳转
        saveToken(user);
        router.replace('/');
      } catch (err: any) {
        setError(err.message || '登录失败，请稍后重试');
        toast({
          title: '登录失败',
          description: err.message || '登录失败，请稍后重试',
          variant: 'destructive',
          duration: 3000,
        });
        setLoading(false);
      }
    },
    [debouncedEmail, debouncedPassword, validateForm, router, toast]
  );

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setPassword(e.target.value);
  }, []);

  // 预加载注册页面
  useEffect(() => {
    router.prefetch('/register');

    // 模拟页面加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 py-16 bg-[#f5f5f7]">
        <Suspense fallback={<LoginFormSkeleton />}>
          {isLoading ? (
            <LoginFormSkeleton />
          ) : (
            <LoginForm
              email={email}
              password={password}
              loading={loading}
              error={error}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onSubmit={handleSubmit}
            />
          )}
        </Suspense>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
