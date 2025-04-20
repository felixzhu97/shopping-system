'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useCart } from '@/lib/cart-context';

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/cart"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回购物车
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">结算</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* 配送信息 */}
                <Card>
                  <CardHeader>
                    <CardTitle>配送信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">姓氏</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">名字</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">详细地址</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">城市</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">省份</Label>
                        <Select
                          defaultValue={formData.province}
                          onValueChange={value => handleSelectChange('province', value)}
                        >
                          <SelectTrigger id="province">
                            <SelectValue placeholder="选择省份" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beijing">北京市</SelectItem>
                            <SelectItem value="shanghai">上海市</SelectItem>
                            <SelectItem value="guangdong">广东省</SelectItem>
                            <SelectItem value="jiangsu">江苏省</SelectItem>
                            <SelectItem value="zhejiang">浙江省</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">邮政编码</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className={errors.postalCode ? 'border-red-500' : ''}
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-red-500">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 支付方式 */}
                <Card>
                  <CardHeader>
                    <CardTitle>支付方式</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      defaultValue={formData.paymentMethod}
                      onValueChange={value => handleSelectChange('paymentMethod', value)}
                    >
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex-1">
                          信用卡
                        </Label>
                        <div className="flex space-x-1">
                          <div className="h-6 w-10 rounded bg-gray-200"></div>
                          <div className="h-6 w-10 rounded bg-gray-200"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="alipay" id="alipay" />
                        <Label htmlFor="alipay" className="flex-1">
                          支付宝
                        </Label>
                        <div className="h-6 w-10 rounded bg-blue-500"></div>
                      </div>
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="wechat" id="wechat" />
                        <Label htmlFor="wechat" className="flex-1">
                          微信支付
                        </Label>
                        <div className="h-6 w-10 rounded bg-green-500"></div>
                      </div>
                    </RadioGroup>

                    {formData.paymentMethod === 'credit-card' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">卡号</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="**** **** **** ****"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className={errors.cardNumber ? 'border-red-500' : ''}
                          />
                          {errors.cardNumber && (
                            <p className="text-sm text-red-500">{errors.cardNumber}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiration">到期日</Label>
                            <Input
                              id="expiration"
                              name="expiration"
                              placeholder="MM/YY"
                              value={formData.expiration}
                              onChange={handleInputChange}
                              className={errors.expiration ? 'border-red-500' : ''}
                            />
                            {errors.expiration && (
                              <p className="text-sm text-red-500">{errors.expiration}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              placeholder="***"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              className={errors.cvv ? 'border-red-500' : ''}
                            />
                            {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? '处理中...' : '提交订单'}
                </Button>
              </div>
            </form>
          </div>

          {/* 订单摘要 */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">小计</span>
                  <span>¥{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">运费</span>
                  <span>{shipping === 0 ? '免费' : `¥${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">税费</span>
                  <span>¥{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>总计</span>
                  <span>¥{total.toFixed(2)}</span>
                </div>

                <div className="bg-muted p-4 rounded-md text-sm">
                  <p className="font-medium mb-2">安全支付</p>
                  <p className="text-muted-foreground">
                    所有支付信息都经过加密处理，确保您的信息安全。我们不会存储您的卡号。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}
