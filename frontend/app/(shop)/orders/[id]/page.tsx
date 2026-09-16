'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/services/api';
import { Button, Spinner, Badge, EmptyState } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';

import type { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await customerApi.getOrder(params.id as string);
        setOrder(response.data);
      } catch {
        setError('Order not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState icon="😕" title="Order not found" description={error || 'The order you are looking for does not exist.'} />
        <div className="text-center mt-4"><Link href="/orders"><Button>Back to Orders</Button></Link></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/orders" className="hover:text-primary-600">Orders</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-heading">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-neutral-500">{formatDate(order.createdAt)}</p>
          </div>
          <Badge status={order.status} />
        </div>
        <div className="border-t border-neutral-200 pt-4">
          <p className="text-sm text-neutral-600"><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          <p className="text-sm text-neutral-600 mt-1"><strong>Total:</strong> <span className="font-semibold text-primary-600">{formatPrice(order.totalAmount)}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-neutral-100 rounded-md flex items-center justify-center text-xl">📷</div>
                <div>
                  <p className="font-medium text-neutral-900">{item.product?.name || 'Product'}</p>
                  <p className="text-sm text-neutral-500">Qty: {item.quantity} x {formatPrice(item.unitPriceAtPurchase)}</p>
                </div>
              </div>
              <p className="font-semibold text-neutral-900">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
