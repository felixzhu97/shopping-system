import Link from 'next/link';

const StoreHeadline = () => (
  <>
    <section className="py-16 px-4">
      <div className="container max-w-[1040px] mx-auto flex flex-col md:flex-row md:justify-between md:items-end">
        <div className="max-w-[600px]">
          <h2 className="text-5xl font-semibold text-gray-800">购物系统.</h2>
          <p className="text-4xl font-semibold text-gray-500 mt-2">
            以最好的方式购买您喜爱的产品。
          </p>
        </div>
      </div>
    </section>

    <section className="py-8">
      <div className="container max-w-[1040px] mx-auto">
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">快速链接</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: '查找门店', href: '/stores' },
            { name: '订单状态', href: '/orders' },
            { name: '购物帮助', href: '/help' },
            { name: '退货', href: '/returns' },
            { name: '收藏夹', href: '/saved' },
          ].map(link => (
            <Link
              key={link.name}
              href={link.href}
              className="border border-gray-300 rounded-full px-5 py-2 text-sm inline-flex items-center hover:border-gray-800 transition-colors"
            >
              <span>{link.name}</span>
              <span className="ml-1">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default StoreHeadline;
