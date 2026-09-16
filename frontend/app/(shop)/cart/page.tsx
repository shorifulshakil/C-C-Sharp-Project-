'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { customerApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Spinner, EmptyState } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Cart } from '@/types';
import toast from 'react-hot-toast';

function CartContent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const response = await customerApi.getCart();
      setCart(response.data);
    } catch {
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await customerApi.updateCartItem(itemId, quantity);
      fetchCart();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await customerApi.removeCartItem(itemId);
      toast.success('Item removed from cart');
      fetchCart();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-red-600">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added any products yet."
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8 font-heading">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 truncate">{item.productName}</h3>
                <p className="text-sm text-neutral-500">{formatPrice(item.priceAtAdd)} each</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-neutral-900">{formatPrice(item.subtotal)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal ({cart.items.length} items)</span>
                <span className="font-medium">{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="font-bold text-primary-600 text-xl">{formatPrice(cart.totalAmount)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
            <Link href="/products" className="block text-center mt-3 text-sm text-primary-600 hover:text-primary-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <CartContent />
    </ProtectedRoute>
  );
}
