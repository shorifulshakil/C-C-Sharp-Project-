'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { ApprovalStatus, OrderStatus } from '@/types';

const statusStyles: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Unpublished: 'bg-neutral-100 text-neutral-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: ApprovalStatus | OrderStatus | string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ status, className, children, ...props }, ref) => {
  const displayText = status || children;
  const style = status ? statusStyles[status] || 'bg-neutral-100 text-neutral-800' : 'bg-neutral-100 text-neutral-800';

  return (
    <span
      ref={ref}
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', style, className)}
      {...props}
    >
      {displayText}
    </span>
  );
});

Badge.displayName = 'Badge';
export { Badge };
