'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { customerApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Spinner, EmptyState, Badge, Pagination } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, PaginatedResponse } from '@/types';

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await customerApi.getOrders({ page: currentPage, pageSize: 10 });
        const data = response.data as PaginatedResponse<Order>;
        setOrders(data.items);
        setTotalPages(Math.ceil(data.total / data.pageSize));
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6 font-heading">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={
            <Link href="/products"><Button>Browse Products</Button></Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-neutral-500">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-neutral-500">{formatDate(order.createdAt)}</p>
                </div>
                <Badge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600">{order.items.length} item(s)</p>
                <p className="font-semibold text-neutral-900">{formatPrice(order.totalAmount)}</p>
              </div>
            </Link>
          ))}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer']}>
      <OrdersContent />
    </ProtectedRoute>
  );
}
