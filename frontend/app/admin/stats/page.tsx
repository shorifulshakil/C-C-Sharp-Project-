'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner, Card, CardBody , LoadingProgress} from '@/components/ui';
import type { PlatformStats } from '@/types';

function StatsContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch {
        // error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  const statsData = [
    { label: 'Total Users', value: stats.totalUsers, description: 'All registered users' },
    { label: 'Total Dealers', value: stats.totalDealers, description: 'Registered dealers' },
    { label: 'Total Customers', value: stats.totalCustomers, description: 'Registered customers' },
    { label: 'Total Products', value: stats.totalProducts, description: 'All products listed' },
    { label: 'Pending Products', value: stats.pendingProducts, description: 'Awaiting approval' },
    { label: 'Approved Products', value: stats.approvedProducts, description: 'Publicly visible' },
    { label: 'Rejected Products', value: stats.rejectedProducts, description: 'Rejected by admin' },
    { label: 'Total Orders', value: stats.totalOrders, description: 'All orders placed' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, description: 'Lifetime revenue' },
  ];


  return (


    <>


      <LoadingProgress isLoading={isLoading} />


      {isLoading ? (


        <div className="flex justify-center py-12">


          <Spinner size="lg" />


        </div>


      ) : (


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <p className="text-sm text-neutral-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-sm text-neutral-400 mt-1">{stat.description}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  


      )}


    </>


  );
}

export default function StatsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Platform Statistics">
        <StatsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
