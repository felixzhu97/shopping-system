'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, User, X, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

// 定义快捷链接数据
const quickLinks = [
  { title: '智能设备', path: '/products?q=pro' },
  { title: '智能耳机', path: '/products?q=耳机' },
  { title: '智能手机', path: '/products?q=iphone' },
];

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBadgeAnimate, setCartBadgeAnimate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { cartItems, itemCount, subtotal } = useCart();

  // 根据路径分析当前分类
  const getCurrentCategory = (): string => {
    if (!pathname) return '';
    const url = new URL(pathname, 'http://example.com');
    if (url.pathname.includes('/products')) {
      // 简单方法：检查路径是否包含特定关键词
      if (url.pathname.includes('/electronics')) return 'electronics';
      if (url.pathname.includes('/clothing')) return 'clothing';
      if (url.pathname.includes('/home-kitchen')) return 'home-kitchen';
      if (url.pathname.includes('/books')) return 'books';
    }
    return '';
  };

  // 当前分类
  const currentCategory = getCurrentCategory();

  // 监听滚动位置改变导航栏样式，并在滚动时隐藏搜索框
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      // 页面滚动时隐藏搜索栏
      if (scrollY > 10 && showSearch) {
        setShowSearch(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSearch]);

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
    if (!searchQuery.trim()) return;

    // 构建搜索URL
    const searchUrl = `/products?q=${encodeURIComponent(searchQuery)}`;
    window.location.href = searchUrl;
    setShowSearch(false);
  };

  // 切换搜索框显示
  const toggleSearch = () => {
    const newShowSearch = !showSearch;
    setShowSearch(newShowSearch);

    // 打开搜索时防止页面滚动
    if (newShowSearch) {
      // 当打开搜索框时聚焦
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
    }
  };

  // 按ESC键关闭搜索
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSearch]);

  return (
    <div className="relative">
      <header
        className={`sticky top-0 z-50 w-full bg-[rgba(251,251,253,0.8)] backdrop-blur-md transition-all duration-300 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        {/* Apple 风格导航栏 */}
        <div className="max-w-[1040px] mx-auto h-12 md:h-12 flex items-center justify-between px-4">
          {/* 移动端菜单按钮 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-800 p-0 hover:bg-transparent"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:w-[350px]">
              <div className="mt-4 mb-8">
                <Link href="/" className="text-xl font-medium">
                  购物系统
                </Link>
              </div>
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className={`text-lg ${pathname === '/' ? 'text-blue-500' : 'text-gray-800'}`}
                >
                  首页
                </Link>
                <Link
                  href="/products"
                  className={`text-lg ${
                    pathname === '/products' && !currentCategory ? 'text-blue-500' : 'text-gray-800'
                  }`}
                >
                  全部商品
                </Link>
                <Link
                  href="/products?category=electronics"
                  className={`text-lg ${
                    currentCategory === 'electronics' ? 'text-blue-500' : 'text-gray-800'
                  }`}
                >
                  电子产品
                </Link>
                <Link
                  href="/products?category=clothing"
                  className={`text-lg ${
                    currentCategory === 'clothing' ? 'text-blue-500' : 'text-gray-800'
                  }`}
                >
                  服装
                </Link>
                <Link
                  href="/products?category=home-kitchen"
                  className={`text-lg ${
                    currentCategory === 'home-kitchen' ? 'text-blue-500' : 'text-gray-800'
                  }`}
                >
                  家居厨房
                </Link>
                <Link
                  href="/products?category=books"
                  className={`text-lg ${
                    currentCategory === 'books' ? 'text-blue-500' : 'text-gray-800'
                  }`}
                >
                  图书
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center mx-auto md:mx-0">
            <svg
              height="22"
              viewBox="0 0 14 44"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden md:block"
            >
              <path d="m13.0729 17.6825a3.61 3.61 0 0 0 -1.7248 3.0251 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1 -1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.9089-2.4787-2.0243a9.7842 9.7842 0 0 1 -1.6628-5.2776c0-3.0867 2.0039-4.7291 3.9658-4.7291 1.0535 0 1.9314.6919 2.5924.6919.63 0 1.6112-.7333 2.8092-.7333a3.7579 3.7579 0 0 1 3.1677 1.5817zm-3.7284-2.8918a3.5615 3.5615 0 0 0 .8469-2.22 1.5353 1.5353 0 0 0 -.031-.32 3.5686 3.5686 0 0 0 -2.3445 1.2084 3.4629 3.4629 0 0 0 -.878 2.1585 1.419 1.419 0 0 0 .031.2892 1.19 1.19 0 0 0 .2169.0207 3.0935 3.0935 0 0 0 2.1586-1.1368z"></path>
            </svg>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex justify-center flex-1 h-full">
            <div className="flex items-center h-full">
              <Link
                href="/"
                className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
                  pathname === '/' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                首页
              </Link>
              <Link
                href="/products"
                className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
                  pathname === '/products' && !currentCategory
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                全部商品
              </Link>
              <Link
                href="/products?category=electronics"
                className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
                  currentCategory === 'electronics'
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                电子产品
              </Link>
              <Link
                href="/products?category=clothing"
                className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
                  currentCategory === 'clothing'
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                服装
              </Link>
              <Link
                href="/products?category=home-kitchen"
                className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
                  currentCategory === 'home-kitchen'
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                家居厨房
              </Link>
              <Link
                href="/products?category=books"
                className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
                  currentCategory === 'books'
                    ? 'text-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                图书
              </Link>
            </div>
          </nav>

          {/* 右侧工具栏 */}
          <div className="flex items-center">
            {/* 搜索按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="text-gray-800 p-1 mr-1 hover:bg-transparent"
            >
              <Search className="h-[17px] w-[17px]" />
              <span className="sr-only">搜索</span>
            </Button>

            {/* 用户按钮 */}
            <Link href="/account">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-800 p-1 mr-1 hover:bg-transparent"
              >
                <User className="h-[17px] w-[17px]" />
                <span className="sr-only">账户</span>
              </Button>
            </Link>

            {/* 购物车按钮 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/cart">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-gray-800 p-1 hover:bg-transparent"
                    >
                      <ShoppingCart className="h-[17px] w-[17px]" />
                      {itemCount > 0 && (
                        <Badge
                          variant="destructive"
                          className={`absolute -top-1 -right-1 h-[14px] w-[14px] p-0 flex items-center justify-center rounded-full text-[10px] ${
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
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索 产品"
                className="w-full pl-8 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="ghost" size="sm" className="ml-2">
              搜索
            </Button>
          </form>
        </div>
      </header>

      {/* 搜索栏 - 类似Apple官网的悬浮展开效果 */}
      <div
        className={cn(
          'fixed inset-x-0 top-12 z-40 overflow-hidden transition-all duration-300 ease-in-out bg-[rgba(251,251,253,0.95)] backdrop-blur-md border-b border-gray-200 shadow-sm',
          showSearch ? 'h-[204px] opacity-100' : 'h-0 opacity-0'
        )}
      >
        <div className="container max-w-[1040px] mx-auto h-full">
          <div className="pt-5 px-4 h-full flex flex-col">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="搜索 产品"
                  className="pl-10 pr-10 h-11 bg-[#f5f5f7] border-none shadow-none focus-visible:ring-0 rounded-lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* 快捷链接 */}
            <div className="mt-4 flex-1 overflow-hidden">
              <div className="text-xs uppercase text-gray-500 font-medium mb-2">快捷链接</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.path}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
                      onClick={() => setShowSearch(false)}
                    >
                      <ChevronRight className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
