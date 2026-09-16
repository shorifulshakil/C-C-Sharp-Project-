'use client';

import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/features/auth';
import type { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  title: string;
}

export function DashboardLayout({ children, allowedRoles, title }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-neutral-900 mb-6 font-heading">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
