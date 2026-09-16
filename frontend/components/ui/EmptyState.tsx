'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)} {...props}>
      {icon && <div className="mx-auto mb-4 text-neutral-400 text-4xl">{icon}</div>}
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
      {description && <p className="text-neutral-500 mb-4 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}
