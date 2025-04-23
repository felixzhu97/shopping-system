'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  ChevronLeft,
  Package,
  CreditCardIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useCart } from '@/lib/cart-context';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

// 添加表单数据类型
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: string;
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
}

// 添加表单错误类型
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
}

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 添加表单状态
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'shanghai',
    postalCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiration: '',
    cvv: '',
  });
  // 添加错误状态
  const [errors, setErrors] = useState<FormErrors>({});

  // 如果购物车为空，重定向到购物车页面
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems.length, router]);

  if (cartItems.length === 0) {
    return null;
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.06;
  const total = subtotal + shipping + tax;

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // 清除该字段的错误
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // 处理选择变化
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 验证基础信息
    if (!formData.firstName.trim()) {
      newErrors.firstName = '请输入姓氏';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = '请输入名字';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号码';
      isValid = false;
    } else if (!/^\d{11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = '请输入有效的11位手机号码';
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = '请输入详细地址';
      isValid = false;
    }

    if (!formData.city.trim()) {
      newErrors.city = '请输入城市';
      isValid = false;
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = '请输入邮政编码';
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = '请输入有效的6位邮政编码';
      isValid = false;
    }

    // 验证信用卡信息（如果选择了信用卡支付）
    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber?.trim()) {
        newErrors.cardNumber = '请输入卡号';
        isValid = false;
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = '请输入有效的16位卡号';
        isValid = false;
      }

      if (!formData.expiration?.trim()) {
        newErrors.expiration = '请输入到期日';
        isValid = false;
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiration)) {
        newErrors.expiration = '请使用MM/YY格式';
        isValid = false;
      }

      if (!formData.cvv?.trim()) {
        newErrors.cvv = '请输入CVV码';
        isValid = false;
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = '请输入有效的CVV码';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!validateForm()) {
      toast({
        title: '表单验证失败',
        description: '请检查并修正表单中的错误',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 这里应该有真实的API调用来创建订单
      // 模拟API调用的等待时间
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 清空购物车
      await clearCart();

      // 显示成功提示
      toast({
        title: '订单已提交',
        description: '感谢您的购买！我们将尽快处理您的订单。',
        duration: 5000,
      });

      // 跳转到订单成功页面
      router.push('/checkout/success');
    } catch (error) {
      console.error('提交订单失败:', error);
      toast({
        title: '提交订单失败',
        description: '无法处理您的订单，请稍后再试。',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/cart"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              返回购物袋
            </Link>
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 mb-8">结算</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* 配送信息 */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">配送信息</h2>
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                            姓氏
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              'h-12 rounded-xl transition-colors',
                              errors.firstName
                                ? 'border-red-500 focus:ring-red-500'
                                : 'focus:ring-blue-500'
                            )}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-red-500 flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                            名字
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              'h-12 rounded-xl transition-colors',
                              errors.lastName
                                ? 'border-red-500 focus:ring-red-500'
                                : 'focus:ring-blue-500'
                            )}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-red-500 flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          邮箱
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={cn(
                            'h-12 rounded-xl transition-colors',
                            errors.email
                              ? 'border-red-500 focus:ring-red-500'
                              : 'focus:ring-blue-500'
                          )}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          手机号码
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className={cn(
                            'h-12 rounded-xl transition-colors',
                            errors.phone
                              ? 'border-red-500 focus:ring-red-500'
                              : 'focus:ring-blue-500'
                          )}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                          详细地址
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className={cn(
                            'h-12 rounded-xl transition-colors',
                            errors.address
                              ? 'border-red-500 focus:ring-red-500'
                              : 'focus:ring-blue-500'
                          )}
                        />
                        {errors.address && (
                          <p className="text-sm text-red-500 flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.address}
                          </p>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                            城市
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              'h-12 rounded-xl transition-colors',
                              errors.city
                                ? 'border-red-500 focus:ring-red-500'
                                : 'focus:ring-blue-500'
                            )}
                          />
                          {errors.city && (
                            <p className="text-sm text-red-500 flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.city}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                            省份
                          </Label>
                          <Select
                            defaultValue={formData.province}
                            onValueChange={value => handleSelectChange('province', value)}
                          >
                            <SelectTrigger id="province" className="h-12 rounded-xl">
                              <SelectValue placeholder="选择省份" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="beijing">北京市</SelectItem>
                              <SelectItem value="shanghai">上海市</SelectItem>
                              <SelectItem value="guangdong">广东省</SelectItem>
                              <SelectItem value="jiangsu">江苏省</SelectItem>
                              <SelectItem value="zhejiang">浙江省</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                            邮政编码
                          </Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            className={cn(
                              'h-12 rounded-xl transition-colors',
                              errors.postalCode
                                ? 'border-red-500 focus:ring-red-500'
                                : 'focus:ring-blue-500'
                            )}
                          />
                          {errors.postalCode && (
                            <p className="text-sm text-red-500 flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 支付方式 */}
                  <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">支付方式</h2>
                    <div className="space-y-6">
                      <RadioGroup
                        defaultValue={formData.paymentMethod}
                        onValueChange={value => handleSelectChange('paymentMethod', value)}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-xl hover:border-blue-500 transition-colors">
                          <RadioGroupItem
                            value="credit-card"
                            id="credit-card"
                            className="text-blue-600"
                          />
                          <Label
                            htmlFor="credit-card"
                            className="flex-1 font-medium cursor-pointer"
                          >
                            信用卡
                          </Label>
                          <div className="flex space-x-2">
                            <div className="h-8 w-12 rounded bg-gradient-to-r from-blue-400 to-blue-600"></div>
                            <div className="h-8 w-12 rounded bg-gradient-to-r from-yellow-400 to-red-500"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-xl hover:border-blue-500 transition-colors">
                          <RadioGroupItem value="alipay" id="alipay" className="text-blue-600" />
                          <Label htmlFor="alipay" className="flex-1 font-medium cursor-pointer">
                            支付宝
                          </Label>
                          <div className="h-8 w-12 rounded bg-blue-500"></div>
                        </div>
                        <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-xl hover:border-blue-500 transition-colors">
                          <RadioGroupItem value="wechat" id="wechat" className="text-blue-600" />
                          <Label htmlFor="wechat" className="flex-1 font-medium cursor-pointer">
                            微信支付
                          </Label>
                          <div className="h-8 w-12 rounded bg-green-500"></div>
                        </div>
                      </RadioGroup>

                      {formData.paymentMethod === 'credit-card' && (
                        <div className="pt-4 space-y-6 border-t border-gray-100">
                          <div className="space-y-2">
                            <Label
                              htmlFor="cardNumber"
                              className="text-sm font-medium text-gray-700"
                            >
                              卡号
                            </Label>
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="**** **** **** ****"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className={cn(
                                'h-12 rounded-xl transition-colors',
                                errors.cardNumber
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'focus:ring-blue-500'
                              )}
                            />
                            {errors.cardNumber && (
                              <p className="text-sm text-red-500 flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {errors.cardNumber}
                              </p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="expiration"
                                className="text-sm font-medium text-gray-700"
                              >
                                到期日
                              </Label>
                              <Input
                                id="expiration"
                                name="expiration"
                                placeholder="MM/YY"
                                value={formData.expiration}
                                onChange={handleInputChange}
                                className={cn(
                                  'h-12 rounded-xl transition-colors',
                                  errors.expiration
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'focus:ring-blue-500'
                                )}
                              />
                              {errors.expiration && (
                                <p className="text-sm text-red-500 flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {errors.expiration}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                                CVV
                              </Label>
                              <Input
                                id="cvv"
                                name="cvv"
                                placeholder="***"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className={cn(
                                  'h-12 rounded-xl transition-colors',
                                  errors.cvv
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'focus:ring-blue-500'
                                )}
                              />
                              {errors.cvv && (
                                <p className="text-sm text-red-500 flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {errors.cvv}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-base transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        处理中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        提交订单
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* 订单摘要 */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">订单摘要</h2>
                <div className="space-y-5">
                  <div className="max-h-80 overflow-auto pr-2 space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#f5f5f7] p-2 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                            fallbackAlt={item.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <div className="text-sm text-gray-500">
                            ¥{item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium text-sm">
                          ¥{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>小计</span>
                      <span>¥{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>运费</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? '免费' : `¥${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <div className="text-xs text-green-600 -mt-2 flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        您已获得免费配送
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>税费</span>
                      <span>¥{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-medium text-lg">
                    <span>总计</span>
                    <span>¥{total.toFixed(2)}</span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-sm mt-6">
                    <div className="flex items-start">
                      <Package className="h-5 w-5 text-gray-700 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">配送说明</p>
                        <p className="text-gray-600 mt-1">
                          标准配送时间为1-3个工作日，订单满¥200享受免费配送服务。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
