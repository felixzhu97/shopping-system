import Link from 'next/link';

// 扩展导航区域组件
function ExtendedNavigation() {
  const navItems = [
    {
      title: '商品与服务',
      links: [
        { name: '全部商品', href: '/products' },
        { name: '电子产品', href: '/products?category=electronics' },
        { name: '服装', href: '/products?category=clothing' },
        { name: '家居厨房', href: '/products?category=home-kitchen' },
        { name: '图书', href: '/products?category=books' },
        { name: '配件', href: '/products?category=accessories' },
        { name: '礼品卡', href: '/gift-cards' },
      ],
    },
    {
      title: '账户',
      links: [
        { name: '管理您的账户', href: '/account' },
        { name: '会员账户', href: '/account/membership' },
        { name: '我的订单', href: '/account/orders' },
        { name: '我的收藏', href: '/account/saved' },
      ],
    },
    {
      title: '购物指南',
      links: [
        { name: '查找门店', href: '/stores' },
        { name: '今日优惠', href: '/promotions' },
        { name: '购物帮助', href: '/help' },
        { name: '配送政策', href: '/shipping' },
        { name: '退换货政策', href: '/returns' },
        { name: '支付方式', href: '/payment' },
      ],
    },
    {
      title: '关于我们',
      links: [
        { name: '公司简介', href: '/about' },
        { name: '新闻中心', href: '/news' },
        { name: '招贤纳士', href: '/careers' },
        { name: '企业责任', href: '/responsibility' },
        { name: '联系我们', href: '/contact' },
      ],
    },
    {
      title: '商务合作',
      links: [
        { name: '商务购买', href: '/business' },
        { name: '教育优惠', href: '/education' },
        { name: '供应商合作', href: '/suppliers' },
        { name: '广告服务', href: '/advertising' },
      ],
    },
  ];

  return (
    <div className="py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {navItems.map(category => (
            <div key={category.title}>
              <h3 className="font-semibold text-sm text-gray-900 mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="text-gray-600 bg-[#f5f5f7]">
      {/* Extended Navigation */}
      <ExtendedNavigation />
      <div className="container mx-auto px-4">
        <div className="border-t border-gray-200 py-8">
          <div className="md:flex md:items-center md:justify-between text-xs text-gray-500">
            <p>Copyright © 2025 购物系统. 版权所有.</p>
            <div className="flex flex-wrap mt-4 md:mt-0 gap-x-6">
              <Link href="/privacy" className="hover:underline">
                隐私政策
              </Link>
              <Link href="/terms" className="hover:underline">
                使用条款
              </Link>
              <Link href="/sales" className="hover:underline">
                销售政策
              </Link>
              <Link href="/legal" className="hover:underline">
                法律信息
              </Link>
              <Link href="/sitemap" className="hover:underline">
                网站地图
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
