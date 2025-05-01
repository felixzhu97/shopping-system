import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-white shadow p-4">
      {/* 图片占位 */}
      <Skeleton className="w-full aspect-square rounded-lg mb-4" />
      {/* 标题占位 */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      {/* 副标题占位 */}
      <Skeleton className="h-4 w-1/2 mb-2" />
      {/* 价格占位 */}
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
}
