'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const dealerLinks = [
  { href: '/dealer/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dealer/profile', label: 'Shop Profile', icon: '🏪' },
  { href: '/dealer/products', label: 'My Products', icon: '📦' },
  { href: '/dealer/products/new', label: 'New Product', icon: '➕' },
  { href: '/dealer/sales', label: 'Sales', icon: '💰' },
  { href: '/dealer/orders', label: 'Orders', icon: '📋' },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/dealers', label: 'Dealers', icon: '🏪' },
  { href: '/admin/products/pending', label: 'Pending Products', icon: '⏳' },
  { href: '/admin/categories', label: 'Categories', icon: '📁' },
  { href: '/admin/users', label: 'Customers', icon: '👥' },
  { href: '/admin/stats', label: 'Stats', icon: '📈' },
  { href: '/admin/profile', label: 'My Profile', icon: '👤' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = user?.role === 'Admin' ? adminLinks : dealerLinks;

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
