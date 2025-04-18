'use client';

import { useState } from 'react';
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

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果购物车为空，重定向到购物车页面
  if (cartItems.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.06;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                        <Input id="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">名字</Label>
                        <Input id="lastName" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input id="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号码</Label>
                      <Input id="phone" type="tel" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">详细地址</Label>
                      <Input id="address" required />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">城市</Label>
                        <Input id="city" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">省份</Label>
                        <Select defaultValue="shanghai">
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
                        <Input id="postalCode" required />
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
                    <RadioGroup defaultValue="credit-card">
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

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">卡号</Label>
                      <Input id="cardNumber" placeholder="**** **** **** ****" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiration">到期日</Label>
                        <Input id="expiration" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="***" />
                      </div>
                    </div>
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

      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}
