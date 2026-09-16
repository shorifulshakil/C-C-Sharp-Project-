'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { customerApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'Customer') {
      toast.error('Please login as a customer to add items to cart');
      return;
    }
    try {
      const cartRes = await customerApi.getCart();
      const cart = cartRes.data;
      const existingItem = cart.items?.find((item: { productId: string }) => item.productId === product.id);
      if (existingItem) {
        await customerApi.updateCartItem(existingItem.id, existingItem.quantity + 1);
      } else {
        await customerApi.addToCart(product.id, 1);
      }
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="aspect-square bg-neutral-100 relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {product.stockQuantity <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-neutral-900 px-4 py-2 rounded-full text-sm font-semibold">Out of Stock</span>
            </div>
          )}
          {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <div className="absolute top-3 left-3">
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">Only {product.stockQuantity} left</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-neutral-500 mb-1">{product.categoryName || product.category?.name || 'Uncategorized'}</p>
          <h3 className="font-semibold text-neutral-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          {(product.dealerName || product.dealer?.shopName) && (
            <p className="text-xs font-medium text-indigo-600 mb-2 flex items-center gap-1">
              <span>🏪</span>
              <span>{product.dealerName || product.dealer?.shopName}</span>
            </p>
          )}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</p>
              {product.stockQuantity > 0 ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">In Stock</span>
              ) : (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">Sold Out</span>
              )}
            </div>
            {user?.role === 'Customer' && product.stockQuantity > 0 && (
              <button
                onClick={handleAddToCart}
                className="mt-3 w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
