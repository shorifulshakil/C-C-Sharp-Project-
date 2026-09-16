'use client';

import { useState, useEffect } from 'react';
import { dealerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner, EmptyState, Card, CardBody , LoadingProgress} from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { DealerSalesResponse } from '@/types';

function DealerSalesContent() {
  const [sales, setSales] = useState<DealerSalesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await dealerApi.getSales();
        setSales(response.data as DealerSalesResponse);
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (!sales || sales.items.length === 0) {
    return (
      <EmptyState
        icon="💰"
        title="No sales yet"
        description="When customers purchase your products, your sales data will appear here."
      />
    );
  }


  return (


    <>


      <LoadingProgress isLoading={isLoading} />


      {isLoading ? (


        <div className="flex justify-center py-12">


          <Spinner size="lg" />


        </div>


      ) : (


        <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
              {formatPrice(sales.totalRevenue)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded inline-block">
              {sales.totalOrders}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500 mb-1">Items Sold</p>
            <p className="text-3xl font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">
              {sales.totalProductsSold}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Sales by Product</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {sales.items.map((item) => (
            <div key={item.productId}>
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
                onClick={() => setExpandedProduct(expandedProduct === item.productId ? null : item.productId)}
              >
                <div className="flex items-center gap-4">
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-neutral-100 flex items-center justify-center text-neutral-400 text-lg">
                      📦
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-neutral-900">{item.productName}</p>
                    <p className="text-sm text-neutral-500">
                      {formatPrice(item.unitPrice)} x {item.totalQuantitySold} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-700">{formatPrice(item.totalRevenue)}</p>
                  <p className="text-xs text-neutral-500">
                    {item.customers.length} customer{item.customers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {expandedProduct === item.productId && item.customers.length > 0 && (
                <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-100">
                  <p className="text-xs font-medium text-neutral-500 uppercase mb-3">Customer Purchases</p>
                  <div className="space-y-2">
                    {item.customers.map((customer, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium text-neutral-900">{customer.customerName}</span>
                          <span className="text-neutral-400 mx-2">·</span>
                          <span className="text-neutral-500">{customer.customerEmail}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-900">{customer.quantity}x</span>
                          <span className="text-neutral-400 mx-2">·</span>
                          <span className="text-neutral-600">{formatPrice(customer.subtotal)}</span>
                          <span className="text-neutral-400 mx-2">·</span>
                          <span className="text-neutral-400 text-xs">
                            {new Date(customer.orderDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  


      )}


    </>


  );
}

export default function DealerSalesPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="My Sales">
        <DealerSalesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
