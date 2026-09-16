'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { publicApi } from '@/services/api';
import { useDebounce } from '@/hooks';
import { Button, Input, Select, EmptyState, Pagination } from '@/components/ui';
import { ProductCard } from '@/features/products';
import { ProductGridSkeleton } from '@/components/ui/ProductGridSkeleton';
import { LoadingProgress } from '@/components/ui/LoadingProgress';
import type { Product, Category, PaginatedResponse } from '@/types';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [priceRange, setPriceRange] = useState({ min: searchParams.get('minPrice') || '', max: searchParams.get('maxPrice') || '' });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await publicApi.getCategories();
        const data = Array.isArray(response.data) ? response.data : (response.data as { items?: Category[] })?.items || [];
        setCategories(data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number | undefined> = {
          page: currentPage,
          pageSize: 12,
          sortBy,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory) params.categoryId = selectedCategory;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        const response = await publicApi.getProducts(params);
        const data = response.data as PaginatedResponse<Product>;
        setProducts(data.items);
        setTotal(data.total);
        setTotalPages(Math.ceil(data.total / 12));
      } catch {
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, selectedCategory, sortBy, currentPage, priceRange.min, priceRange.max]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const hasFilters = searchQuery || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading Progress Bar */}
      <LoadingProgress isLoading={isLoading} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 font-heading">
          {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || 'Products' : 'All Products'}
        </h1>
        <p className="text-neutral-500 mt-1">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 bg-neutral-200 rounded-full animate-pulse" />
              Loading products...
            </span>
          ) : (
            `${total} products found`
          )}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-6 sticky top-24">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm uppercase tracking-wider">Search</h3>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm uppercase tracking-wider">Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm uppercase tracking-wider">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm uppercase tracking-wider">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => { setPriceRange(prev => ({ ...prev, min: e.target.value })); setCurrentPage(1); }}
                  className="w-1/2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => { setPriceRange(prev => ({ ...prev, max: e.target.value })); setCurrentPage(1); }}
                  className="w-1/2 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton count={12} columns={3} />
          ) : error ? (
            <div className="text-center py-16 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No products found"
              description="Try adjusting your filters or search query."
              action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
