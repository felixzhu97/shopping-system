import Link from 'next/link';
import Image from '@/components/ui/image';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';

// 商品卡片组件
const ProductCard = ({ item }: { item: Product }) => (
  <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
    <Link href={`/products/${item.id}`} className="block h-full">
      <div className="p-4">
        <div className="h-36 w-full overflow-hidden rounded-xl mb-3">
          <Image
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            loading="lazy"
            width={144}
            height={144}
          />
        </div>
        <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
        <p className="text-sm text-gray-600 mt-1">¥{item.price.toFixed(2)}</p>
      </div>
    </Link>
  </div>
);

// 类别展示卡片组件
const CategoryCard = ({ category }: { category: any }) => (
  <div
    className={`rounded-2xl overflow-hidden ${category.color} hover:shadow-md transition-shadow`}
  >
    <Link href={`/products?category=${category.id}`} className="block h-full">
      <div className="p-6 flex flex-col h-full">
        <h4 className="text-2xl font-semibold mb-3">{category.name}</h4>
        <p className="text-sm text-gray-600 mb-6">{category.description}</p>
        <div className="mt-auto">
          <div className="h-40 w-full overflow-hidden rounded-xl mb-4">
            <Image
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover"
              loading="lazy"
              width={160}
              height={160}
            />
          </div>
          <div
            className={`${category.titleColor.replace('text-', 'text-')} hover:underline text-sm font-medium`}
          >
            了解更多 &gt;
          </div>
        </div>
      </div>
    </Link>
  </div>
);

// 查看更多卡片组件
const ViewMoreCard = ({ category }: { category: any }) => (
  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <Link href={`/products?category=${category.id}`} className="block h-full">
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <span className={`text-xl ${category.titleColor}`}>&gt;</span>
        </div>
        <h4 className="text-lg font-medium mb-2">查看所有</h4>
        <p className="text-sm text-gray-600">{category.name}</p>
      </div>
    </Link>
  </div>
);

// 类别展示区组件
async function CategoryShowcase() {
  try {
    // 并行获取所有类别数据
    const [electronics, clothing, homeKitchen, books] = await Promise.all([
      api.getProducts('electronics'),
      api.getProducts('clothing'),
      api.getProducts('home-kitchen'),
      api.getProducts('books'),
    ]);

    const categories = [
      {
        id: 'electronics',
        name: '电子产品',
        description: '探索最新科技产品，体验科技带来的便利与乐趣',
        items: electronics.slice(0, 8),
        image: '/electronics.jpg',
        color: 'bg-blue-50',
        titleColor: 'text-blue-600',
      },
      {
        id: 'clothing',
        name: '服装',
        description: '时尚穿搭，展现个性，彰显您的独特魅力',
        items: clothing.slice(0, 8),
        image: '/clothing.jpg',
        color: 'bg-purple-50',
        titleColor: 'text-purple-600',
      },
      {
        id: 'home-kitchen',
        name: '家居厨房',
        description: '打造舒适生活空间，让家更有温度',
        items: homeKitchen.slice(0, 8),
        image: '/home-kitchen.jpg',
        color: 'bg-amber-50',
        titleColor: 'text-amber-600',
      },
      {
        id: 'books',
        name: '图书',
        description: '知识的海洋，尽在掌握，开启智慧之门',
        items: books.slice(0, 8),
        image: '/books.jpg',
        color: 'bg-green-50',
        titleColor: 'text-green-600',
      },
    ];

    return (
      <div className="space-y-24">
        {categories.map(category => (
          <div key={category.id} className="mb-16">
            <div className="container max-w-[1040px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <CategoryCard category={category} />

                {category.items.slice(0, 6).map((item: Product) => (
                  <ProductCard key={item.id} item={item} />
                ))}

                <ViewMoreCard category={category} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('获取类别产品数据时出错:', error);
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">无法加载类别数据</h3>
        <p className="text-gray-500">请稍后再试</p>
      </div>
    );
  }
}

export default CategoryShowcase;
