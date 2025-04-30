'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { register } from '@/lib/api/users';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { saveToken } from '@/lib/store/userStore';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const { toast } = useToast();

  // 使用防抖处理输入
  const debouncedFormData = useDebounce(formData, 300);

  // 从结算页面获取预填充数据
  useEffect(() => {
    const savedInfo = localStorage.getItem('checkoutInfo');
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo);
        setFormData(prev => ({
          ...prev,
          firstName: parsedInfo.firstName || '',
          lastName: parsedInfo.lastName || '',
          email: parsedInfo.email || '',
          phone: parsedInfo.phone || '',
        }));
      } catch (error) {
        console.error('Error parsing saved info:', error);
      }
    }
  }, []);

  // 表单验证
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 验证名字
    if (!formData.firstName.trim()) {
      newErrors.firstName = '请输入名字';
      isValid = false;
    }

    // 验证姓氏
    if (!formData.lastName.trim()) {
      newErrors.lastName = '请输入姓氏';
      isValid = false;
    }

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
      isValid = false;
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位';
      isValid = false;
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, setErrors]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev: FormData) => ({
        ...prev,
        [name]: value,
      }));
      // 清除对应字段的错误信息
      setErrors((prev: FormErrors) => ({
        ...prev,
        [name]: '',
      }));
    },
    [setFormData, setErrors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const user = await register({
          email: debouncedFormData.email,
          password: debouncedFormData.password,
          firstName: debouncedFormData.firstName,
          lastName: debouncedFormData.lastName,
          phone: debouncedFormData.phone,
        });

        toast({
          title: '注册成功',
          description: '欢迎加入购物系统！',
          duration: 3000,
        });

        // 保存用户信息并跳转
        saveToken(user);
        router.replace('/');
      } catch (err: any) {
        toast({
          title: '注册失败',
          description: err.message || '注册失败，请稍后重试',
          variant: 'destructive',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [debouncedFormData, validateForm, router, toast]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 py-16 bg-[#f5f5f7]">
        <div className="w-full max-w-[580px] mx-auto">
          <h1 className="text-[40px] font-medium text-center mb-2">创建账户</h1>

          <div className="bg-white rounded-2xl p-8 mt-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    name="firstName"
                    placeholder="姓氏"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="h-12 px-4 text-base"
                    disabled={loading}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <div className="text-red-500 text-sm">{errors.firstName}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    name="lastName"
                    placeholder="名字"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="h-12 px-4 text-base"
                    disabled={loading}
                    autoComplete="family-name"
                  />
                  {errors.lastName && <div className="text-red-500 text-sm">{errors.lastName}</div>}
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="邮箱"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>

              <div className="space-y-2">
                <Input
                  name="phone"
                  type="tel"
                  placeholder="手机号码"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="tel"
                />
                {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
              </div>

              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="密码"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
              </div>

              <div className="space-y-2">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <div className="text-red-500 text-sm">{errors.confirmPassword}</div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required disabled={loading} />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  我同意{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    服务条款
                  </Link>{' '}
                  和{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    隐私政策
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span className="ml-2">注册中...</span>
                  </div>
                ) : (
                  '创建账户'
                )}
              </Button>

              <div className="text-center text-sm">
                已有账户？{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  立即登录
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}
