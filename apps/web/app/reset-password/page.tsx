'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { resetPassword } from '@/lib/api/users';
import PasswordTips from '@/components/password-tips';
import { EyeIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  emailOrPhone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // 表单验证
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 验证邮箱或手机号
    const emailRegex = z.string().email();
    const phoneRegex = z.string().regex(/^1[3-9]\d{9}$/);

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = '请输入邮箱或手机号';
      isValid = false;
    } else {
      const isEmail = emailRegex.safeParse(formData.emailOrPhone).success;
      const isPhone = phoneRegex.safeParse(formData.emailOrPhone).success;
      if (!isEmail && !isPhone) {
        newErrors.emailOrPhone = '请输入有效的邮箱或手机号';
        isValid = false;
      }
    }

    const passwordRegex = z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入新密码';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少为8位';
      isValid = false;
    } else if (!passwordRegex.safeParse(formData.password).success) {
      newErrors.password = '请检查密码格式是否正确';
      isValid = false;
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

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
        await resetPassword({
          emailOrPhone: formData.emailOrPhone,
          newPassword: formData.password,
        });
        toast({
          title: '密码重置成功',
          description: '请登录',
        });
        router.replace('/login');
      } catch (err: any) {
        setErrors((prev: FormErrors) => ({
          ...prev,
          emailOrPhone: err.message || '重置密码失败，请稍后重试',
        }));
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, router]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4 py-16 bg-[#f5f5f7]">
        <div className="w-full max-w-[580px] mx-auto">
          <h1 className="text-[40px] font-medium text-center mb-2">重置密码</h1>

          <div className="bg-white rounded-2xl p-8 mt-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  name="emailOrPhone"
                  placeholder="邮箱或手机号"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.emailOrPhone && (
                  <div className="text-red-500 text-xs absolute bottom--6">
                    {errors.emailOrPhone}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="新密码"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setShowPasswordTips(true)}
                  onBlur={() => setShowPasswordTips(false)}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                  autoComplete="off"
                />
                <EyeIcon
                  onClick={() => setShowPassword(!showPassword)}
                  size={20}
                  className="absolute right-4 top-1/2 transform -translate-y-3/4 text-gray-500 cursor-pointer"
                />
                {errors.password && (
                  <div className="text-red-500 text-xs absolute bottom--6">{errors.password}</div>
                )}

                {showPasswordTips && <PasswordTips password={formData.password} />}
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="确认新密码"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 px-4 text-base"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className="text-red-500 text-xs absolute bottom--6">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span className="ml-2">提交中...</span>
                  </div>
                ) : (
                  '重置密码'
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
    </div>
  );
}
