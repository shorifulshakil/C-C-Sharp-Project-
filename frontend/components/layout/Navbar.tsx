'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-primary-600 font-heading">ShopHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'Customer' && (
                <Link
                  href="/cart"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/cart')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  Cart
                </Link>
              )}
              {isAuthenticated && user?.role === 'Dealer' && (
                <Link
                  href="/dealer/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dealer')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  Dealer Panel
                </Link>
              )}
              {isAuthenticated && user?.role === 'Admin' && (
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-semibold overflow-hidden shrink-0 border border-indigo-200">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden sm:block max-w-[120px] truncate">{user?.fullName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900">{user?.fullName}</p>
                        <p className="text-xs text-neutral-500">{user?.email}</p>
                      </div>
                      {user?.role === 'Customer' && (
                        <>
                          <Link href="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Orders</Link>
                          <Link href="/account" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Account Settings</Link>
                        </>
                      )}
                      {user?.role === 'Dealer' && (
                        <>
                          <Link href="/dealer/dashboard" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Dashboard</Link>
                          <Link href="/dealer/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Shop Settings & Profile</Link>
                          <Link href="/dealer/products" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My Products</Link>
                          <Link href="/dealer/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Orders</Link>
                        </>
                      )}
                      {user?.role === 'Admin' && (
                        <>
                          <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Dashboard</Link>
                          <Link href="/admin/dealers" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Manage Dealers</Link>
                          <Link href="/admin/users" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Manage Users</Link>
                          <Link href="/admin/products/pending" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Pending Products</Link>
                          <Link href="/admin/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Admin Settings</Link>
                        </>
                      )}
                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-200 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href) ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'Customer' && (
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50">Cart</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
