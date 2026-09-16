'use client';

import { cn } from '@/lib/utils';

interface ProductDetailSkeletonProps {
  className?: string;
}

export function ProductDetailSkeleton({ className }: ProductDetailSkeletonProps) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 bg-neutral-100 rounded-full w-16" />
        <div className="h-4 bg-neutral-100 rounded-full w-4" />
        <div className="h-4 bg-neutral-100 rounded-full w-24" />
        <div className="h-4 bg-neutral-100 rounded-full w-4" />
        <div className="h-4 bg-neutral-100 rounded-full w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image gallery skeleton */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-neutral-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Category badge */}
          <div className="h-6 bg-neutral-100 rounded-full w-24" />

          {/* Title */}
          <div className="space-y-3">
            <div className="h-8 bg-neutral-100 rounded-full w-3/4" />
            <div className="h-8 bg-neutral-100 rounded-full w-1/2" />
          </div>

          {/* Dealer info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-neutral-100 rounded-full w-32" />
              <div className="h-3 bg-neutral-100 rounded-full w-24" />
            </div>
          </div>

          {/* Price */}
          <div className="h-10 bg-neutral-100 rounded-full w-32" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-neutral-100 rounded-full w-full" />
            <div className="h-4 bg-neutral-100 rounded-full w-full" />
            <div className="h-4 bg-neutral-100 rounded-full w-3/4" />
          </div>

          {/* Stock and quantity */}
          <div className="flex items-center gap-6">
            <div className="h-6 bg-neutral-100 rounded-full w-24" />
            <div className="h-10 bg-neutral-100 rounded-lg w-32" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <div className="h-12 bg-neutral-100 rounded-lg flex-1" />
            <div className="h-12 bg-neutral-100 rounded-lg w-12" />
          </div>

          {/* Shipping info */}
          <div className="border-t border-neutral-200 pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-100 rounded-full" />
              <div className="h-4 bg-neutral-100 rounded-full w-40" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-100 rounded-full" />
              <div className="h-4 bg-neutral-100 rounded-full w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-16">
        <div className="h-6 bg-neutral-100 rounded-full w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="aspect-square bg-neutral-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-neutral-100 rounded-full w-1/3" />
                <div className="h-4 bg-neutral-100 rounded-full w-full" />
                <div className="h-4 bg-neutral-100 rounded-full w-2/3" />
                <div className="h-5 bg-neutral-100 rounded-full w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
