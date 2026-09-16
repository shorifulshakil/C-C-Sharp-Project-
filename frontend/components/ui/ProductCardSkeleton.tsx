'use client';

import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-neutral-200 overflow-hidden', className)}>
      {/* Image skeleton */}
      <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 bg-neutral-100 rounded-full w-1/3" />

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-neutral-100 rounded-full w-full" />
          <div className="h-4 bg-neutral-100 rounded-full w-2/3" />
        </div>

        {/* Dealer */}
        <div className="h-3 bg-neutral-100 rounded-full w-1/2" />

        {/* Price and stock */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-neutral-100 rounded-full w-1/4" />
          <div className="h-3 bg-neutral-100 rounded-full w-1/4" />
        </div>

        {/* Button */}
        <div className="h-10 bg-neutral-100 rounded-lg w-full mt-3" />
      </div>
    </div>
  );
}
