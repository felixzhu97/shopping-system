'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, User } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/lib/cart-context';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBadgeAnimate, setCartBadgeAnimate] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartItems, itemCount, subtotal } = useCart();

  // 获取当前分类参数
  const currentCategory = searchParams.get('category') || '';

  // 监听滚动位置改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 监听购物车数量变化，添加动画效果
  useEffect(() => {
    if (itemCount > 0) {
      setCartBadgeAnimate(true);
      const timer = setTimeout(() => setCartBadgeAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 构建搜索URL
    const searchUrl = `/products?q=${encodeURIComponent(searchQuery)}`;
    window.location.href = searchUrl;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">切换菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="mt-4 mb-8">
              <Link href="/" className="text-xl font-bold">
                购物系统
              </Link>
            </div>
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className={`text-lg font-medium ${pathname === '/' ? 'text-primary' : ''}`}
              >
                首页
              </Link>
              <Link
                href="/products"
                className={`text-lg font-medium ${
                  pathname === '/products' && !currentCategory ? 'text-primary' : ''
                }`}
              >
                全部商品
              </Link>
              <Link
                href="/products?category=electronics"
                className={`text-lg font-medium ${
                  currentCategory === 'electronics' ? 'text-primary' : ''
                }`}
              >
                电子产品
              </Link>
              <Link
                href="/products?category=clothing"
                className={`text-lg font-medium ${
                  currentCategory === 'clothing' ? 'text-primary' : ''
                }`}
              >
                服装
              </Link>
              <Link
                href="/products?category=home-kitchen"
                className={`text-lg font-medium ${
                  currentCategory === 'home-kitchen' ? 'text-primary' : ''
                }`}
              >
                家居厨房
              </Link>
              <Link
                href="/products?category=books"
                className={`text-lg font-medium ${
                  currentCategory === 'books' ? 'text-primary' : ''
                }`}
              >
                图书
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2">
          <span className="text-xl font-bold">购物系统</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/products"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/products' && !currentCategory
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            全部商品
          </Link>
          <Link
            href="/products?category=electronics"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentCategory === 'electronics' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            电子产品
          </Link>
          <Link
            href="/products?category=clothing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentCategory === 'clothing' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            服装
          </Link>
          <Link
            href="/products?category=home-kitchen"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentCategory === 'home-kitchen' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            家居厨房
          </Link>
          <Link
            href="/products?category=books"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentCategory === 'books' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            图书
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex-1 md:flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索商品..."
              className="w-full pl-8 rounded-l-md rounded-r-none border-r-0"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="rounded-l-none">
            搜索
          </Button>
        </form>

        {/* User and cart */}
        <div className="flex items-center space-x-4">
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">账户</span>
            </Button>
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className={`absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] ${
                          cartBadgeAnimate ? 'animate-bounce' : ''
                        }`}
                      >
                        {itemCount}
                      </Badge>
                    )}
                    <span className="sr-only">购物车</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              {itemCount > 0 && (
                <TooltipContent side="bottom">
                  <div className="text-xs">
                    <p className="font-semibold">
                      {itemCount}件商品 - ¥{subtotal.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">点击查看购物车</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* 移动端搜索栏 */}
      <div className="md:hidden p-2 border-t">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索商品..."
              className="w-full pl-8 rounded-l-md rounded-r-none border-r-0"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="rounded-l-none px-3">
            搜索
          </Button>
        </form>
      </div>
    </header>
  );
}
