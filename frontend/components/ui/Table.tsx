'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table({ headers, children, emptyMessage = 'No data available', isLoading, className, ...props }: TableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className={cn('min-w-full divide-y divide-neutral-200', className)} {...props}>
          <thead className="bg-neutral-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {headers.map((_, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-neutral-200', className)} {...props}>
        <thead className="bg-neutral-50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}
