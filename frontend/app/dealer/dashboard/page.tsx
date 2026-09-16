'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dealerApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Card, CardBody, Spinner, EmptyState, Badge , LoadingProgress} from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { Product, PaginatedResponse, DealerSalesResponse } from '@/types';

function DealerDashboardContent() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<DealerSalesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          dealerApi.getProducts({ pageSize: 5 }),
          dealerApi.getSales().catch(() => null),
        ]);
        const data = productsRes.data as PaginatedResponse<Product>;
        const products = data.items;
        setRecentProducts(products);
        setStats({
          total: data.total,
          pending: products.filter((p) => p.approvalStatus === 'Pending').length,
          approved: products.filter((p) => p.approvalStatus === 'Approved').length,
          rejected: products.filter((p) => p.approvalStatus === 'Rejected').length,
        });
        if (salesRes) {
          setSalesData(salesRes.data as DealerSalesResponse);
        }
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.total, color: 'bg-primary-50 text-primary-700' },
    { label: 'Pending Approval', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700' },
  ];


  return (


    <>


      <LoadingProgress isLoading={isLoading} />


      {isLoading ? (


        <div className="flex justify-center py-12">


          <Spinner size="lg" />


        </div>


      ) : (


        <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} px-2 py-1 rounded inline-block`}>{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {salesData && salesData.totalRevenue > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">{formatPrice(salesData.totalRevenue)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-blue-700">{salesData.totalOrders}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-neutral-500 mb-1">Items Sold</p>
              <p className="text-2xl font-bold text-purple-700">{salesData.totalProductsSold}</p>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Products</h2>
              <Link href="/dealer/products"><Button size="sm">View All</Button></Link>
            </div>
            {recentProducts.length === 0 ? (
              <EmptyState icon="📦" title="No products yet" description="Create your first product to get started." action={<Link href="/dealer/products/new"><Button size="sm">New Product</Button></Link>} />
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="text-sm text-neutral-500">{formatPrice(product.price)}</p>
                    </div>
                    <Badge status={product.approvalStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link href="/dealer/products/new" className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <span className="text-xl">➕</span>
                <div>
                  <p className="font-medium text-neutral-900">Add New Product</p>
                  <p className="text-sm text-neutral-500">Create a new product listing</p>
                </div>
              </Link>
              <Link href="/dealer/sales" className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <span className="text-xl">💰</span>
                <div>
                  <p className="font-medium text-neutral-900">View Sales</p>
                  <p className="text-sm text-neutral-500">See which products sold and to whom</p>
                </div>
              </Link>
              <Link href="/dealer/orders" className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <span className="text-xl">📋</span>
                <div>
                  <p className="font-medium text-neutral-900">View Orders</p>
                  <p className="text-sm text-neutral-500">Check order status and details</p>
                </div>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  


      )}


    </>


  );
}

export default function DealerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="Dealer Dashboard">
        <DealerDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
