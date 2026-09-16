'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Badge, Pagination, ConfirmDialog, Input, LoadingProgress, Card, CardBody } from '@/components/ui';
import type { DealerProfile, User, PaginatedResponse } from '@/types';

function CustomersContent() {
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State for Dealer Customers
  const [selectedDealer, setSelectedDealer] = useState<DealerProfile | null>(null);
  const [dealerCustomers, setDealerCustomers] = useState<User[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Status Change Dialog State
  const [statusId, setStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDealers = async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDealers({ search: searchQuery, page: 1, pageSize: 50 });
      const data = response.data as PaginatedResponse<DealerProfile>;
      setDealers(data.items);
    } catch {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleSearch = () => {
    fetchDealers(search);
  };

  const handleOpenDealerCustomers = async (dealer: DealerProfile) => {
    setSelectedDealer(dealer);
    setIsLoadingCustomers(true);
    setCustomerSearch('');
    try {
      const response = await adminApi.getDealerCustomers(dealer.id);
      const resData = response.data;
      let customersList: User[] = [];
      if (Array.isArray(resData)) {
        customersList = resData;
      } else if (resData && Array.isArray(resData.items)) {
        customersList = resData.items;
      }
      setDealerCustomers(customersList);
    } catch {
      setDealerCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusId) return;
    setIsUpdating(true);
    try {
      await adminApi.updateUserStatus(statusId, { isActive: newStatus });
      setDealerCustomers((prev) => prev.map((u) => u.id === statusId ? { ...u, isActive: newStatus } : u));
      setStatusId(null);
    } catch {
      // error handled silently
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredCustomers = dealerCustomers.filter(c => 
    !customerSearch || 
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

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
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Dealer Customers Management</h2>
              <p className="text-sm text-neutral-500 mt-1">Select a dealer below to view and manage their registered customers.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 items-end max-w-lg">
            <div className="flex-1">
              <Input
                label="Search Dealer"
                placeholder="Search by shop name, owner, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
          </div>

          {/* Dealers List Table */}
          {dealers.length === 0 ? (
            <EmptyState icon="🏬" title="No dealers found" description="No dealers registered in the system." />
          ) : (
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Shop Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Owner / Email</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Customers</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {dealers.map((dealer) => (
                      <tr key={dealer.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                          {dealer.shopName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                            {dealer.shopCategory || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          <p className="font-medium text-neutral-800">{dealer.userFullName || 'N/A'}</p>
                          <p className="text-xs text-neutral-500">{dealer.userEmail || ''}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            👥 {dealer.customerCount ?? 0} Customer{(dealer.customerCount ?? 0) !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenDealerCustomers(dealer)}
                          >
                            View Customers
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dealer Customers Modal Window */}
          {selectedDealer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDealer(null)} />
              
              <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col z-10 overflow-hidden border border-neutral-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Customers of {selectedDealer.shopName}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Dealer Owner: <span className="font-medium text-neutral-700">{selectedDealer.userFullName}</span> ({selectedDealer.userEmail})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDealer(null)}
                    className="text-neutral-400 hover:text-neutral-600 text-xl font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  {/* Search inside modal */}
                  <div className="max-w-xs">
                    <Input
                      placeholder="Filter customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>

                  {isLoadingCustomers ? (
                    <div className="flex justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <EmptyState icon="👥" title="No customers found" description="No customers registered for this dealer yet." />
                  ) : (
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-neutral-200 text-sm">
                        <thead className="bg-neutral-100/70">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Customer Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Joined</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-neutral-50">
                              <td className="px-4 py-3 font-medium text-neutral-900">{customer.fullName}</td>
                              <td className="px-4 py-3 text-neutral-600">{customer.email}</td>
                              <td className="px-4 py-3 text-neutral-600">{customer.phone || '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {customer.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-neutral-600">{new Date(customer.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => { setStatusId(customer.id); setNewStatus(!customer.isActive); }}
                                  className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${customer.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                >
                                  {customer.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
                  <Button variant="ghost" onClick={() => setSelectedDealer(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Dialog */}
          <ConfirmDialog
            isOpen={!!statusId}
            onClose={() => setStatusId(null)}
            onConfirm={handleStatusChange}
            title={newStatus ? 'Activate Customer' : 'Deactivate Customer'}
            description={`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this customer?`}
            variant={newStatus ? 'primary' : 'danger'}
            isLoading={isUpdating}
          />
        </div>
      )}
    </>
  );
}

export default function CustomersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Customers">
        <CustomersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
