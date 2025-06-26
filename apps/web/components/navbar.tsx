'use client';

import React, { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  ChevronRight,
  CircleUserRound,
  Cog,
  Menu,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

import PanelDropdown from '@/components/ui/panel-dropdown';
import Image from '@/components/ui/image';
import { clearUserStore, useToken } from '@/lib/store/userStore';
import { useCartItems } from '@/lib/store/cartStore';
// 定义快捷链接数据
const quickLinks = [
  { title: '智能设备', path: '/products?category=electronics' },
  { title: '精美服装', path: '/products?category=clothing' },
  { title: '实用家具', path: '/products?category=home-kitchen' },
  { title: '经典图书', path: '/products?category=books' },
];

// 将购物车项组件提取出来并使用 memo 包装
const CartItem = memo(({ item }: { item: any }) => (
  <div className="flex items-center mb-4 last:mb-0">
    <div className="w-10 h-10 rounded-lg bg-gray-100 mr-4 border overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-out">
      <Image
        src={item.product?.image || ''}
        alt={item.product?.name || ''}
        className="w-full h-full object-cover"
        width={40}
        height={40}
        loading={'lazy'}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-sm text-gray-900 truncate">{item.product?.name || ''}</div>
      <div className="text-xs text-gray-500 truncate">{item.product?.description || ''}</div>
    </div>
  </div>
));

CartItem.displayName = 'CartItem';

// 将购物车下拉菜单组件提取出来并使用 memo 包装
const CartDropdown = memo(
  ({
    open,
    onClose,
    items,
    router,
  }: {
    open: boolean;
    onClose: () => void;
    items: any[];
    router: any;
  }) => {
    const [token, setToken] = useState('');
    const userToken = useToken();

    const handleLogout = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        router.replace('/login');
        setTimeout(() => {
          clearUserStore();
          onClose();
        }, 500);
      },
      [router, onClose]
    );

    const handleCartClick = useCallback(() => {
      router.push('/cart');
      onClose();
    }, [router, onClose]);

    useEffect(() => {
      setToken(userToken || '');
    }, [userToken]);

    return (
      <PanelDropdown
        open={open}
        onClose={onClose}
        heightClassName="h-auto"
        containerClassName="!top-12"
      >
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[600px] px-10 py-12">
            <div className="font-bold text-2xl mb-8">购物袋</div>
            <div className="mb-8">
              {items.length === 0 ? (
                <div className="text-gray-500 text-sm py-8">您的购物袋是空的</div>
              ) : (
                <>
                  {items.slice(0, 3).map((item, idx) => (
                    <CartItem key={item.product?.id || idx} item={item} />
                  ))}
                  {items.length > 3 && (
                    <div className="text-xs text-gray-500 mt-2">
                      还有 {items.length - 3} 件商品在购物袋中
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mb-10">
              <Button
                className="bg-blue-600 text-white rounded-lg px-8 h-11 text-base font-medium hover:bg-blue-700 transition w-full"
                onClick={handleCartClick}
              >
                查看购物袋
              </Button>
            </div>
            <div className="text-xs text-gray-500 font-semibold mb-2">我的账户</div>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>
                <Link
                  href="/orders"
                  className="hover:underline flex items-center gap-2"
                  onClick={onClose}
                >
                  <Box className="w-4 h-4" />
                  我的订单
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="hover:underline flex items-center gap-2"
                  onClick={onClose}
                >
                  <Cog className="w-4 h-4" />
                  账户设置
                </Link>
              </li>
              <li>
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="hover:underline flex items-center gap-2 text-left w-full"
                  >
                    <CircleUserRound className="w-4 h-4" />
                    退出登录
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="hover:underline flex items-center gap-2"
                    onClick={onClose}
                  >
                    <CircleUserRound className="w-4 h-4" />
                    登录
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </PanelDropdown>
    );
  }
);

CartDropdown.displayName = 'CartDropdown';

// 将导航链接组件提取出来并使用 memo 包装
const NavLink = memo(
  ({
    href,
    isActive,
    children,
  }: {
    href: string;
    isActive: boolean;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={`text-[12px] h-full flex items-center font-normal px-2 mx-1 transition-colors ${
        isActive ? 'text-blue-500' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  )
);

NavLink.displayName = 'NavLink';

// 提取出使用 useSearchParams 的客户端组件
function NavbarClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBadgeAnimate, setCartBadgeAnimate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const items = useCartItems();

  // 使用 useCallback 优化事件处理函数
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      const searchUrl = `/products?q=${encodeURIComponent(searchQuery)}`;
      router.push(searchUrl);
      setShowSearch(false);
    },
    [searchQuery, router]
  );

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
  }, []);

  // 使用 useMemo 缓存计算值
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const currentCategory = useMemo(() => {
    if (!pathname) return '';
    if (pathname.includes('/products')) {
      const category = searchParams.get('category');
      if (category) {
        return category;
      }
    }
    return '';
  }, [pathname, searchParams]);

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

  return (
    <div className="relative">
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-[rgba(251,251,253,0.8)] backdrop-blur-md transition-all duration-300 ${
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

            {/* 购物车按钮 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-800 p-1 hover:bg-transparent"
                onClick={() => setShowCart(v => !v)}
                aria-label="购物车"
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
              <CartDropdown
                open={showCart}
                onClose={() => setShowCart(false)}
                items={items}
                router={router}
              />
            </div>
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
      <div className="h-12 md:h-12"></div>

      {/* 搜索栏 - 类似Apple官网的悬浮展开效果 */}
      <PanelDropdown
        open={showSearch}
        onClose={() => setShowSearch(false)}
        heightClassName="h-[204px]"
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
      </PanelDropdown>
    </div>
  );
}

// 导出主导航栏组件，用Suspense包裹客户端组件
export function Navbar() {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarClient />
    </Suspense>
  );
}

// 导航栏加载占位符
function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[rgba(251,251,253,0.8)] backdrop-blur-md">
      <div className="max-w-[1040px] mx-auto h-12 md:h-12 flex items-center justify-between px-4">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="hidden md:flex justify-center flex-1 h-full">
          <div className="flex items-center h-full space-x-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-16 h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </header>
  );
}
