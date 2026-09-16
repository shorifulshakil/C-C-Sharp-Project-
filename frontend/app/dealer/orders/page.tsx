'use client';

import { useState, useEffect } from 'react';
import { dealerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, LoadingProgress } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Order, PaginatedResponse, OrderStatus } from '@/types';

function DealerOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await dealerApi.getOrders({ page: currentPage, pageSize: 10 });
      const data = response.data as PaginatedResponse<Order>;
      setOrders(data.items);
      setTotalPages(Math.ceil(data.total / (data.pageSize || 10)));
    } catch {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setToastMessage(null);
    try {
      await dealerApi.updateOrderStatus(orderId, newStatus);
      setToastMessage({
        type: 'success',
        text: `Order status successfully updated to ${newStatus}.`,
      });
      // Refresh local list
      await fetchOrders();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to update order status.';
      setToastMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <>
      <LoadingProgress isLoading={isLoading} />

      {toastMessage && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between text-sm ${
            toastMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-500 hover:text-neutral-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-neutral-900">Orders Management</h2>
            <span className="text-sm text-neutral-500">{orders.length} total orders</span>
          </div>

          {orders.length === 0 ? (
            <EmptyState icon="📋" title="No orders yet" description="Orders containing your products will appear here." />
          ) : (
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {orders.map((order) => {
                      const isUpdating = updatingOrderId === order.id;
                      const isExpanded = expandedOrderId === order.id;

                      return (
                        <>
                          <tr key={order.id} className={isExpanded ? 'bg-neutral-50' : 'hover:bg-neutral-50/50 transition-colors'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                              <button
                                onClick={() => toggleExpand(order.id)}
                                className="text-primary-600 hover:text-primary-800 font-mono hover:underline flex items-center gap-1"
                              >
                                <span>{isExpanded ? '▼' : '▶'}</span>
                                #{order.id.slice(0, 8)}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                              {order.customerName || 'Customer'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {order.items.length} item(s)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-semibold">
                              {formatPrice(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge status={order.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {isUpdating ? (
                                <div className="inline-flex items-center gap-2 text-neutral-500">
                                  <Spinner size="sm" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {order.status === 'Pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                                      >
                                        Accept / Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}

                                  {order.status === 'Confirmed' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleUpdateStatus(order.id, 'Processing')}
                                      >
                                        Process Order
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}

                                  {order.status === 'Processing' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                                      >
                                        Mark Shipped
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}

                                  {order.status === 'Shipped' && (
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                                    >
                                      Mark Delivered
                                    </Button>
                                  )}

                                  {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                                    <span className="text-xs text-neutral-400 font-normal">Completed</span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr key={`${order.id}-details`} className="bg-neutral-50/80">
                              <td colSpan={7} className="px-6 py-4 border-t border-b border-neutral-200">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start text-xs text-neutral-600 bg-white p-3 rounded border border-neutral-200">
                                    <div>
                                      <p className="font-semibold text-neutral-800">Customer Details:</p>
                                      <p>{order.customerName || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-neutral-800">Shipping Address:</p>
                                      <p>{order.shippingAddress || 'No address provided'}</p>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-neutral-800">Order Placed:</p>
                                      <p>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded border border-neutral-200 overflow-hidden">
                                    <table className="min-w-full divide-y divide-neutral-100 text-xs">
                                      <thead className="bg-neutral-100/70">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-neutral-600 font-medium">Product</th>
                                          <th className="px-4 py-2 text-center text-neutral-600 font-medium">Quantity</th>
                                          <th className="px-4 py-2 text-right text-neutral-600 font-medium">Unit Price</th>
                                          <th className="px-4 py-2 text-right text-neutral-600 font-medium">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-neutral-100">
                                        {order.items.map((item) => (
                                          <tr key={item.id}>
                                            <td className="px-4 py-2 text-neutral-800 font-medium">{item.productName}</td>
                                            <td className="px-4 py-2 text-center text-neutral-600">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right text-neutral-600">{formatPrice(item.unitPriceAtPurchase)}</td>
                                            <td className="px-4 py-2 text-right text-neutral-800 font-semibold">{formatPrice(item.subtotal)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
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
        </div>
      )}
    </>
  );
}

export default function DealerOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="Orders">
        <DealerOrdersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
