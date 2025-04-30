'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronLeft, CreditCard } from 'lucide-react';

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
import { useCartStore } from '@/lib/store/cartStore';
import { useUserStore } from '@/lib/store/userStore';
import { useCheckoutStore } from '@/lib/store/checkoutStore';
// import { useAccountStore } from '@/lib/store/accountStore';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils/utils';
import { provinces } from '@/components/china-region';
import { createOrder } from '@/lib/api/orders';

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
  const {
    formData,
    errors,
    selectedProvince,
    selectedCity,
    isSubmitting,
    setFormData,
    setErrors,
    setSelectedProvince,
    setSelectedCity,
    setIsSubmitting,
    resetForm,
  } = useCheckoutStore();
  const { toast } = useToast();
  const router = useRouter();

  // 2. 所有 useMemo hooks
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

  // 3. 表单处理函数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ [name]: value });
  };

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.name === value);
    if (province) {
      setSelectedProvince(value);
      setSelectedCity('');
    }
  };

  const handleCityChange = (value: string) => {
    const city = provinces.find(p => p.cities.includes(value));
    if (city) {
      setSelectedCity(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
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

    // 验证其他字段
    if (!formData.firstName) {
      newErrors.firstName = '请输入名字';
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = '请输入姓氏';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = '请输入邮箱';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = '请输入手机号';
      isValid = false;
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
      isValid = false;
    }

    if (!formData.address) {
      newErrors.address = '请输入详细地址';
      isValid = false;
    }

    if (!formData.postalCode) {
      newErrors.postalCode = '请输入邮政编码';
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = '请输入有效的邮政编码';
      isValid = false;
    }

    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber) {
        newErrors.cardNumber = '请输入卡号';
        isValid = false;
      } else if (!/^\d{16}$/.test(formData.cardNumber)) {
        newErrors.cardNumber = '请输入有效的卡号';
        isValid = false;
      }

      if (!formData.expiration) {
        newErrors.expiration = '请输入有效期';
        isValid = false;
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiration)) {
        newErrors.expiration = '请输入有效的有效期（MM/YY）';
        isValid = false;
      }

      if (!formData.cvv) {
        newErrors.cvv = '请输入CVV';
        isValid = false;
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = '请输入有效的CVV';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: '表单验证失败',
        description: '请检查并修正表单中的错误',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('用户未登录');
      }

      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const order = await createOrder(userId, {
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: selectedCity,
          province: selectedProvince,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
        orderItems,
      });

      // 保存结算信息
      saveCheckoutInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: selectedCity,
        province: selectedProvince,
        postalCode: formData.postalCode,
        paymentMethod: formData.paymentMethod,
      });

      // 清空购物车
      clearCart();

      // 重置表单
      resetForm();

      // 跳转到订单确认页面
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('创建订单失败:', error);
      toast({
        title: '创建订单失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. 加载用户信息
  useEffect(() => {
    try {
      const checkoutInfo = getCheckoutInfo();
      setFormData(checkoutInfo);

      setSelectedProvince(checkoutInfo.province);
      setSelectedCity(checkoutInfo.city);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  }, [getCheckoutInfo, setFormData, setSelectedProvince, setSelectedCity]);

  // 获取当前省份的城市列表
  const currentCities = useMemo(() => {
    return provinces.find(p => p.name === selectedProvince)?.cities || [];
  }, [selectedProvince]);

  // 5. 渲染页面
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
                                  : 'focus:ring-blue-500',
                                !selectedProvince && 'text-muted-foreground'
                              )}
                            >
                              <SelectValue placeholder="选择省份" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
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
                                  : 'focus:ring-blue-500',
                                !selectedCity && 'text-muted-foreground'
                              )}
                            >
                              <SelectValue
                                placeholder={selectedProvince ? '选择城市' : '请先选择省份'}
                              />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {currentCities.map(city => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
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
