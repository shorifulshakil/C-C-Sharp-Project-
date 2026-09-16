'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner, Card, CardBody, Badge, Pagination , LoadingProgress} from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { PlatformStats, DealerProfile, PaginatedResponse } from '@/types';

function AdminDashboardContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dealerPage, setDealerPage] = useState(1);
  const [dealerTotalPages, setDealerTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dealersRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getDealers({ page: 1, pageSize: 10 }),
        ]);
        setStats(statsRes.data);
        const dealerData = dealersRes.data as PaginatedResponse<DealerProfile>;
        setDealers(dealerData.items);
        setDealerTotalPages(Math.max(1, Math.ceil(dealerData.total / 10)));
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDealerPageChange = async (page: number) => {
    setDealerPage(page);
    try {
      const res = await adminApi.getDealers({ page, pageSize: 10 });
      const data = res.data as PaginatedResponse<DealerProfile>;
      setDealers(data.items);
    } catch {
      // error handled silently
    }
  };

  if (!stats) return null;

  const statCards = [
    { label: '📊 Total Users', value: stats.totalUsers, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '🏪 Dealers', value: stats.totalDealers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '👥 Customers', value: stats.totalCustomers, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '📦 Products', value: stats.totalProducts, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '⏳ Pending Products', value: stats.pendingProducts, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: '✅ Approved Products', value: stats.approvedProducts, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '❌ Rejected Products', value: stats.rejectedProducts, color: 'text-red-600', bg: 'bg-red-50' },
    { label: '🛒 Total Orders', value: stats.totalOrders, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '💰 Total Revenue', value: formatPrice(stats.totalRevenue), color: 'text-accent-600', bg: 'bg-amber-50' },
  ];


  return (


    <>


      <LoadingProgress isLoading={isLoading} />


      {isLoading ? (


        <div className="flex justify-center py-12">


          <Spinner size="lg" />


        </div>


      ) : (


        <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Dealer Overview Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">All Dealers</h2>
          <a href="/admin/dealers" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </a>
        </div>
        {dealers.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-neutral-500 py-8">No dealers found</p>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Shop Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {dealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{dealer.shopName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.userFullName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.userEmail || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.userPhone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{dealer.shopCategory}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-[200px] truncate">{dealer.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dealer.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {dealer.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dealer.userIsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {dealer.userIsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{new Date(dealer.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dealerTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-neutral-200">
                <Pagination currentPage={dealerPage} totalPages={dealerTotalPages} onPageChange={handleDealerPageChange} />
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  


      )}


    </>


  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Admin Dashboard">
        <AdminDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
