'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronLeft, CreditCard } from 'lucide-react';
import React from 'react';

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
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useCartStore } from '@/lib/stores/cart';
import { useUserStore } from '@/lib/stores/user';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils/utils';
import { provinces } from '@/components/china-region';
import { createOrder } from '@/lib/api/orders';

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

// 订单摘要商品项组件
const OrderSummaryItem = React.memo(function OrderSummaryItem({ item }: { item: any }) {
  if (!item.product) return null;
  return (
    <div key={item.productId} className="flex items-center space-x-4">
      <div className="relative w-16 h-16">
        <Image
          src={item.product.image}
          alt={item.product.name}
          className="object-cover rounded-lg"
          wrapperClassName="w-16 h-16"
          width={64}
          height={64}
          loading="lazy"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{item.product.name}</h3>
        <p className="text-sm text-gray-500">数量: {item.quantity}</p>
      </div>
      <p className="font-medium">¥{item.product.price * item.quantity}</p>
    </div>
  );
});

export default function CheckoutPage() {
  // 1. 所有 store hooks
  const { items, clearCart } = useCartStore();
  const { getUserId, getCheckoutInfo, saveCheckoutInfo } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();

  // 2. 所有 useState hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiration: '',
    cvv: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // 3. 所有 useMemo hooks
  const { subtotal, shipping, tax, total } = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      if (!item.product) return total;
      return total + item.product.price * item.quantity;
    }, 0);
    const shipping = subtotal > 200 ? 0 : 15;
    const tax = subtotal * 0.06;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  }, [items]);

  // 4. 所有 useCallback hooks
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleProvinceChange = useCallback((value: string) => {
    setSelectedProvince(value);
    const province = provinces.find(p => p.name === value);

    setFormData(prev => ({
      ...prev,
      province: value,
      city: '',
    }));

    // 清除省份和城市的错误
    setErrors(prev => ({
      ...prev,
      province: undefined,
      city: undefined,
    }));

    // 重置城市选择
    setSelectedCity('');
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setSelectedCity(value);
    setFormData(prev => ({
      ...prev,
      city: value,
    }));

    // 清除城市错误
    setErrors(prev => ({
      ...prev,
      city: undefined,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 验证省份
    if (!selectedProvince) {
      newErrors.province = '请选择省份';
      isValid = false;
    }

    // 验证城市
    if (!selectedCity) {
      newErrors.city = '请选择城市';
      isValid = false;
    }

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

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = '请输入邮政编码';
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = '请输入有效的6位邮政编码';
      isValid = false;
    }

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
  }, [formData, selectedProvince, selectedCity]);

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

      setIsSubmitting(true);

      try {
        const userId = getUserId();
        if (!userId) {
          toast({
            title: '未登录',
            description: '请先登录后再提交订单',
            variant: 'destructive',
            duration: 3000,
          });
          setIsSubmitting(false);
          router.push('/login');
          return;
        }

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

        const orderData = {
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.province,
          },
          paymentMethod: formData.paymentMethod,
          items: items.map(item => ({
            productId: item.product?.id || item.productId,
            quantity: item.quantity,
          })),
          totalAmount: total,
        };

        const order = await createOrder(userId, orderData);
        await clearCart();

        // 预加载成功页面
        router.prefetch(`/checkout/success?orderId=${order.id}`);

        toast({
          title: '订单提交成功',
          description: '感谢您的购买！我们将尽快处理您的订单。',
          duration: 3000,
        });

        // 使用 replace 而不是 push，这样用户不能返回到结算页面
        router.replace(`/checkout/success?orderId=${order.id}`);
      } catch (error) {
        console.error('提交订单失败:', error);
        toast({
          title: '提交订单失败',
          description: '无法处理您的订单，请稍后再试。',
          variant: 'destructive',
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, items, total, getUserId, saveCheckoutInfo, clearCart, router, toast]
  );

  // 5. 所有 useEffect hooks
  useEffect(() => {
    const savedInfo = getCheckoutInfo();
    if (savedInfo) {
      // 先设置省份
      if (savedInfo.province) {
        const province = provinces.find(p => p.name === savedInfo.province);
        if (province) {
          setSelectedProvince(savedInfo.province);
          // 只有当城市存在于该省份的城市列表中时才设置
          if (savedInfo.city && province.cities.includes(savedInfo.city)) {
            setSelectedCity(savedInfo.city);
          } else {
            setSelectedCity('');
          }
        }
      }

      // 然后设置表单数据
      setFormData(prev => ({
        ...prev,
        ...savedInfo,
        // 清除支付相关信息
        cardNumber: '',
        expiration: '',
        cvv: '',
        // 确保城市与选择器状态同步
        city:
          savedInfo.city &&
          provinces.find(p => p.name === savedInfo.province)?.cities.includes(savedInfo.city)
            ? savedInfo.city
            : '',
      }));
    }
  }, [getCheckoutInfo]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // 在组件加载时预加载成功页面
  useEffect(() => {
    router.prefetch('/checkout/success');
  }, [router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 全屏Loading遮罩 */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-xl">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mb-4"
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
                <div className="text-lg font-medium text-gray-700">订单提交中，请稍候...</div>
              </div>
            </div>
          )}
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
                            <SelectTrigger
                              id="province"
                              className={cn(
                                'h-12 rounded-xl transition-colors',
                                errors.province
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'focus:ring-blue-500'
                              )}
                            >
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
                          {errors.province && (
                            <p className="text-sm text-red-500 flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.province}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                            城市
                          </Label>
                          <Select
                            value={selectedCity}
                            onValueChange={handleCityChange}
                            disabled={!selectedProvince}
                          >
                            <SelectTrigger
                              id="city"
                              className={cn(
                                'h-12 rounded-xl transition-colors',
                                errors.city
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'focus:ring-blue-500'
                              )}
                            >
                              <SelectValue
                                placeholder={selectedProvince ? '选择城市' : '请先选择省份'}
                              />
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
                          {errors.city && (
                            <p className="text-sm text-red-500 flex items-center mt-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {errors.city}
                            </p>
                          )}
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
                  {items.map(item => (
                    <OrderSummaryItem key={item.productId} item={item} />
                  ))}
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
      <Toaster />
    </div>
  );
}
