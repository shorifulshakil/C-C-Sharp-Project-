'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { publicApi, customerApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';
import { ProductCard } from '@/features/products';
import { ProductGridSkeleton } from '@/components/ui/ProductGridSkeleton';
import { LoadingProgress } from '@/components/ui/LoadingProgress';
import type { Product, Category, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

// Category Icons for UI Rendering (Hardcoded)
const categoryIcons: Record<string, string> = {
  'Electronics': '💻',
  'Clothing': '👕',
  'Home & Garden': '🏡',
  'Books': '📚',
  'Sports': '⚽',
  'Beauty': '💄',
  'Automotive': '🚗',
  'Food & Beverage': '🍕',
};

// Home Page Component
export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data - Categories, Featured Products, Products by Category
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await publicApi.getCategories();
        const cats = Array.isArray(catRes.data) ? catRes.data : (catRes.data as { items?: Category[] })?.items || [];
        setCategories(cats);
        // Featured Products - Top 8 Products (Hardcoded Limit)
        const prodRes = await publicApi.getProducts({ pageSize: 50, sortBy: 'newest' });
        const allProducts = (prodRes.data as PaginatedResponse<Product>).items || [];
        setFeaturedProducts(allProducts.slice(0, 8));

        const grouped: Record<string, Product[]> = {};
        for (const cat of cats) {
          grouped[cat.id] = allProducts.filter(p => p.categoryId === cat.id).slice(0, 5);
        }
        setProductsByCategory(grouped);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Add to Cart
  const handleAddToCart = async (productId: string) => {
    if (!user || user.role !== 'Customer') {
      toast.error('Please login as a customer to add items to cart');
      return;
    }
    try {
      const cartRes = await customerApi.getCart();
      const cart = cartRes.data;
      const existingItem = cart.items?.find((item: { productId: string }) => item.productId === productId);
      if (existingItem) {
        await customerApi.updateCartItem(existingItem.id, existingItem.quantity + 1);
      } else {
        await customerApi.addToCart(productId, 1);
      }
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div>
      {/* Loading Progress Bar */}
      <LoadingProgress isLoading={isLoading} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              Multi-Vendor Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading leading-tight">
              Discover Unique Products from
              <span className="text-primary-200"> Independent Dealers</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              Shop from a curated marketplace of trusted vendors. Every purchase supports small businesses and independent creators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-neutral-100 shadow-lg">
                  Browse Products
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">500+</p>
              <p className="text-sm text-neutral-500">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">50+</p>
              <p className="text-sm text-neutral-500">Dealers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">8</p>
              <p className="text-sm text-neutral-500">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">100%</p>
              <p className="text-sm text-neutral-500">Verified Dealers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 font-heading">Browse by Category</h2>
              <p className="text-neutral-500 mt-1">Find exactly what you&apos;re looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors">
                  <span className="text-2xl">{categoryIcons[cat.name] || '📦'}</span>
                </div>
                <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                <p className="text-xs text-neutral-500 mt-1">{productsByCategory[cat.id]?.length || 0} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 font-heading">Featured Products</h2>
              <p className="text-neutral-500 mt-1">Handpicked products just for you</p>
            </div>
            <Link href="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {isLoading ? (
            <ProductGridSkeleton count={8} columns={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products by Category Rows */}
      {categories.map((cat) => {
        const catProducts = productsByCategory[cat.id] || [];
        if (catProducts.length === 0) return null;
        return (
          <section key={cat.id} className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">{categoryIcons[cat.name] || '📦'}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 font-heading">{cat.name}</h2>
                    <p className="text-sm text-neutral-500">{catProducts.length} products</p>
                  </div>
                </div>
                <Link href={`/products?categoryId=${cat.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {isLoading ? (
                <ProductGridSkeleton count={5} columns={4} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                  {catProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Features */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12 font-heading">Why Shop on ShopHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🛡️', title: 'Verified Dealers', desc: 'Every dealer is reviewed and approved to ensure quality and reliability.' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Your transactions are protected with industry-standard security.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Track your orders in real-time with reliable shipping partners.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-neutral-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Ready to start shopping?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of customers finding unique products from independent dealers.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-neutral-100">
              Explore Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
