'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dealerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, ConfirmDialog , LoadingProgress} from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Product, PaginatedResponse } from '@/types';

function DealerProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await dealerApi.getProducts({ page: currentPage, pageSize: 10 });
        const data = response.data as PaginatedResponse<Product>;
        setProducts(data.items);
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await dealerApi.deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch {
      // error handled silently
    } finally {
      setIsDeleting(false);
    }
  };

  


  return (


    <>


      <LoadingProgress isLoading={isLoading} />


      {isLoading ? (


        <div className="flex justify-center py-12">


          <Spinner size="lg" />


        </div>


      ) : (


        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">My Products</h2>
        <Link href="/dealer/products/new"><Button>New Product</Button></Link>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No products yet"
          description="Create your first product to start selling."
          action={<Link href="/dealer/products/new"><Button>Create Product</Button></Link>}
        />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{product.stockQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge status={product.approvalStatus} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link href={`/dealer/products/${product.id}/edit`} className="text-primary-600 hover:text-primary-700 mr-3">Edit</Link>
                      <button onClick={() => setDeleteId(product.id)} className="text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-neutral-200">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  


      )}


    </>


  );
}

export default function DealerProductsPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="My Products">
        <DealerProductsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
