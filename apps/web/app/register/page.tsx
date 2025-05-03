'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { register } from '@/lib/api/users';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { z } from 'zod';
import { useSaveToken, useSaveUserInfo } from '@/lib/store/userStore';
import PasswordTips from '@/components/password-tips';
import { EyeIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
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
  const saveToken = useSaveToken();
  const saveUserInfo = useSaveUserInfo();

  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // 使用防抖处理输入
  const debouncedFormData = useDebounce(formData, 300);

  // useMemo 缓存正则和 schema
  const emailRegex = useMemo(() => z.string().email(), []);
  const phoneRegex = useMemo(() => z.string().regex(/^1[3-9]\d{9}$/), []);
  const passwordRegex = useMemo(
    () => z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    []
  );

  useEffect(() => {
    if (formData.email || formData.phone) {
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      setErrors(prev => ({
        ...prev,
        email: '',
        phone: '',
      }));
    }
  }, [formData.email, formData.phone]);

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
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!emailRegex.safeParse(formData.email).success) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 验证手机号
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
      isValid = false;
    } else if (!phoneRegex.safeParse(formData.phone).success) {
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
    } else if (!passwordRegex.safeParse(formData.password).success) {
      newErrors.password = '密码必须包含大小写字母、数字和特殊字符';
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
  }, [formData, setErrors, emailRegex, phoneRegex]);

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

        // 保存用户信息并跳转
        saveToken(user.token || '');
        saveUserInfo(user);
        router.replace('/login');

        toast({
          title: '注册成功',
          description: '请登录您的账户',
        });
      } catch (err: any) {
        setErrors((prev: FormErrors) => ({
          ...prev,
          email: err.message || '注册失败，请稍后重试',
          phone: err.message || '注册失败，请稍后重试',
        }));
      } finally {
        setLoading(false);
      }
    },
    [debouncedFormData, validateForm, router, saveToken, saveUserInfo]
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
                    aria-invalid={!!errors.firstName}
                    aria-describedby="firstName-error"
                  />
                  {errors.firstName && (
                    <div
                      className="text-red-500 text-xs mt-1 absolute bottom--6"
                      id="firstName-error"
                      aria-live="polite"
                    >
                      {errors.firstName}
                    </div>
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
                    aria-invalid={!!errors.lastName}
                    aria-describedby="lastName-error"
                  />
                  {errors.lastName && (
                    <div
                      className="text-red-500 text-xs mt-1 absolute bottom--6"
                      id="lastName-error"
                      aria-live="polite"
                    >
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="email"
                  type="email"
                  placeholder="邮箱"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                />
                {errors.email && (
                  <div
                    className="text-red-500 text-xs mt-1 absolute bottom--6"
                    id="email-error"
                    aria-live="polite"
                  >
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="phone"
                  type="tel"
                  placeholder="手机号码"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  aria-describedby="phone-error"
                />
                {errors.phone && (
                  <div
                    className="text-red-500 text-xs mt-1 absolute bottom--6"
                    id="phone-error"
                    aria-live="polite"
                  >
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="密码"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setShowPasswordTips(true)}
                  onBlur={() => setShowPasswordTips(false)}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                />
                <EyeIcon
                  onClick={() => setShowPassword(!showPassword)}
                  size={20}
                  className="absolute right-4 top-1/2 transform -translate-y-3/4 text-gray-500 cursor-pointer"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);
                  }}
                />
                {errors.password && (
                  <div
                    className="text-red-500 text-xs mt-1 absolute bottom--6"
                    id="password-error"
                    aria-live="polite"
                  >
                    {errors.password}
                  </div>
                )}
                {showPasswordTips && <PasswordTips password={formData.password} />}
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirmPassword-error"
                />
                {errors.confirmPassword && (
                  <div
                    className="text-red-500 text-xs mt-1 absolute bottom--6"
                    id="confirmPassword-error"
                    aria-live="polite"
                  >
                    {errors.confirmPassword}
                  </div>
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
                <Link href="/reset-password" className="text-blue-600 hover:underline ml-6">
                  忘记密码？
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
