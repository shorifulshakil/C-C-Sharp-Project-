'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi, customerApi } from '@/services/api';
import { Button, Badge, EmptyState } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { formatPrice, formatDate } from '@/lib/utils';
import { ProductCard } from '@/features/products';
import { ProductDetailSkeleton } from '@/components/ui/ProductDetailSkeleton';
import { LoadingProgress } from '@/components/ui/LoadingProgress';
import type { Product, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await publicApi.getProduct(params.id as string);
        setProduct(response.data);

        if (response.data?.categoryId) {
          try {
            const relatedRes = await publicApi.getProducts({ categoryId: response.data.categoryId, pageSize: 4 });
            const related = (relatedRes.data as PaginatedResponse<Product>).items || [];
            setRelatedProducts(related.filter((p: Product) => p.id !== response.data.id).slice(0, 4));
          } catch {
            // silent
          }
        }
      } catch {
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!user || user.role !== 'Customer') {
      toast.error('Please login as a customer to add items to cart');
      return;
    }
    if (!product) return;
    setIsAdding(true);
    try {
      await customerApi.addToCart(product.id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <LoadingProgress isLoading={isLoading} />
        <ProductDetailSkeleton />
      </>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState icon="😕" title="Product not found" description={error || 'The product you are looking for does not exist.'} />
        <div className="text-center mt-4">
          <Link href="/products"><Button>Back to Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm text-neutral-500">
        <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600 transition-colors">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?categoryId=${product.categoryId}`} className="hover:text-primary-600 transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-neutral-900 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div>
          <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-300">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={img.id} className="aspect-square bg-neutral-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400 cursor-pointer transition-colors">
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{product.category?.name || 'Uncategorized'}</span>
            <Badge status={product.approvalStatus} />
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 font-heading mb-2">{product.name}</h1>

          {(product.dealerName || product.dealer?.shopName) && (
            <div className="flex items-center gap-2.5 mb-4 p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Sold & Shipped by</p>
                <p className="text-base font-bold text-indigo-900 flex items-center gap-2">
                  <span>{product.dealerName || product.dealer?.shopName}</span>
                  {product.dealer?.userFullName && (
                    <span className="text-xs text-neutral-500 font-normal">({product.dealer.userFullName})</span>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-primary-600">{formatPrice(product.price)}</span>
          </div>

          <p className="text-neutral-600 mb-8 leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs text-neutral-500 mb-1">Availability</p>
              <p className={`font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </p>
            </div>
            {product.sku && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-500 mb-1">SKU</p>
                <p className="font-semibold text-neutral-900">{product.sku}</p>
              </div>
            )}
          </div>

          {product.stockQuantity > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-neutral-700">Quantity:</span>
              <div className="flex items-center border border-neutral-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-lg"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {user?.role === 'Customer' && product.stockQuantity > 0 ? (
              <Button size="lg" onClick={handleAddToCart} isLoading={isAdding} className="flex-1">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Add to Cart
              </Button>
            ) : product.stockQuantity === 0 ? (
              <Button size="lg" disabled className="flex-1">Out of Stock</Button>
            ) : (
              <Link href="/auth/login" className="flex-1">
                <Button size="lg" className="w-full">Login to Purchase</Button>
              </Link>
            )}
          </div>

          {product.publishedAt && (
            <p className="text-xs text-neutral-400 mt-4">Listed on {formatDate(product.publishedAt)}</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 font-heading mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
