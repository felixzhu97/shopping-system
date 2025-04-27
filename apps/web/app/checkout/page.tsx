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
import { useCartStore } from '@/lib/cart-store';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { saveCheckoutInfo, getCheckoutInfo } from '@/lib/storage';
import { provinces } from '@/components/china-region';

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
  const { items, clearCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedProvince, setSelectedProvince] = useState(provinces[0].name);
  const [selectedCity, setSelectedCity] = useState(provinces[0].cities[0]);

  // 从本地存储加载结算信息
  useEffect(() => {
    const savedInfo = getCheckoutInfo();
    if (savedInfo) {
      setFormData(prev => ({
        ...prev,
        ...savedInfo,
        // 不保存敏感信息
        cardNumber: '',
        expiration: '',
        cvv: '',
      }));
    }
  }, []);

  // 如果购物车为空，重定向到购物车页面
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const subtotal = items.reduce((total, item) => {
    if (!item.product) return total;
    return total + item.product.price * item.quantity;
  }, 0);
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

  // 省份变化时，自动切换城市
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    const province = provinces.find(p => p.name === value);
    setSelectedCity(province?.cities[0] || '');
    setFormData(prev => ({ ...prev, province: value, city: province?.cities[0] || '' }));
  };

  // 城市变化
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setFormData(prev => ({ ...prev, city: value }));
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
      // 保存结算信息到本地存储（不包含敏感信息）
      const infoToSave = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
      };
      saveCheckoutInfo(infoToSave);

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

      // 跳转到订单成功页面，并传递订单ID
      router.push(`/checkout/success?orderId=123`); // 这里应该使用实际的订单ID
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧表单 */}
            <div className="space-y-6">
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
                          <Label htmlFor="province" className="text-sm font-medium text-gray-700">
                            省份
                          </Label>
                          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                            <SelectTrigger id="province" className="h-12 rounded-xl">
                              <SelectValue placeholder="选择省份" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-72 overflow-y-auto">
                              {provinces.map(prov => (
                                <SelectItem key={prov.name} value={prov.name}>
                                  {prov.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                            城市
                          </Label>
                          <Select value={selectedCity} onValueChange={handleCityChange}>
                            <SelectTrigger id="city" className="h-12 rounded-xl">
                              <SelectValue placeholder="选择城市" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-72 overflow-y-auto">
                              {(provinces.find(p => p.name === selectedProvince)?.cities || []).map(
                                city => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                )
                              )}
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

            {/* 右侧订单摘要 */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">订单摘要</h2>
                <div className="space-y-4">
                  {items.map(item => {
                    if (!item.product) return null;
                    return (
                      <div key={item.productId} className="flex items-center space-x-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            className="object-cover rounded-lg"
                            wrapperClassName="w-16 h-16"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                        </div>
                        <p className="font-medium">¥{item.product.price * item.quantity}</p>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>小计</span>
                    <span>¥{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>运费</span>
                    <span>{shipping === 0 ? '免费' : `¥${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>税费</span>
                    <span>¥{tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>总计</span>
                    <span>¥{total.toFixed(2)}</span>
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
