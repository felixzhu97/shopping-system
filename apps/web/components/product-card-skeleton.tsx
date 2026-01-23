import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all duration-300 ease-out">
      {/* 图片占位 */}
      <div className="aspect-square flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-2xl" />
      </div>
      {/* 标题和价格占位 */}
      <div className="text-center mt-6">
        <Skeleton className="h-7 w-4/5 mx-auto mb-2" />
        <Skeleton className="h-7 w-2/5 mx-auto" />
      </div>
    </div>
  );
}
