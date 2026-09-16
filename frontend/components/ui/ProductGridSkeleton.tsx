'use client';

import { ProductCardSkeleton } from './ProductCardSkeleton';
import { cn } from '@/lib/utils';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGridSkeleton({ count = 8, className, columns = 4 }: ProductGridSkeletonProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
