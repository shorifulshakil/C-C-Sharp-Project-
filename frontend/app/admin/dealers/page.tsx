'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, publicApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Button,
  Spinner,
  EmptyState,
  Badge,
  Pagination,
  ConfirmDialog,
  Input,
  Modal,
  LoadingProgress,
} from '@/components/ui';
import type { DealerProfile, PaginatedResponse, Category } from '@/types';

interface DealerFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  shopName: string;
  shopCategory: string;
  address: string;
  logoUrl: string;
  isApproved: boolean;
}

const initialFormData: DealerFormData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  shopName: '',
  shopCategory: '',
  address: '',
  logoUrl: '',
  isApproved: true,
};

function DealersContent() {
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add / Edit Modal state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DealerFormData>(initialFormData);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await publicApi.getCategories();
        const data = res.data;
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray((data as any).items)) {
          setCategories((data as any).items);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Dealers
  const fetchDealers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDealers({
        search: search || undefined,
        category: categoryFilter || undefined,
        page,
        pageSize: 10,
      });
      const data = response.data as PaginatedResponse<DealerProfile>;
      setDealers(data.items || []);
      setTotalPages(Math.ceil((data.total || 0) / 10) || 1);
    } catch (err) {
      console.error('Failed to fetch dealers', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const handleSearch = () => {
    setPage(1);
    fetchDealers();
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData(initialFormData);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (dealer: DealerProfile) => {
    setEditId(dealer.id);
    setFormData({
      fullName: dealer.userFullName || dealer.fullName || '',
      email: dealer.userEmail || '',
      phone: dealer.userPhone || dealer.phone || '',
      password: '',
      shopName: dealer.shopName || '',
      shopCategory: dealer.shopCategory || '',
      address: dealer.address || '',
      logoUrl: dealer.logoUrl || '',
      isApproved: dealer.isApproved ?? true,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.shopName.trim() ||
      !formData.shopCategory.trim() ||
      !formData.address.trim()
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!editId && !formData.password) {
      setFormError('Password is required when adding a new dealer.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (editId) {
        await adminApi.updateDealer(editId, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password ? formData.password : undefined,
          shopName: formData.shopName,
          shopCategory: formData.shopCategory,
          address: formData.address,
          logoUrl: formData.logoUrl || undefined,
          isApproved: formData.isApproved,
        });
      } else {
        await adminApi.createDealer({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          shopName: formData.shopName,
          shopCategory: formData.shopCategory,
          address: formData.address,
          logoUrl: formData.logoUrl || undefined,
          isApproved: formData.isApproved,
        });
      }
      setShowForm(false);
      fetchDealers();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Unable to save dealer information.';
      setFormError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteDealer(deleteId);
      setDeleteId(null);
      fetchDealers();
    } catch (err) {
      console.error('Failed to delete dealer', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveDealer(id);
      fetchDealers();
    } catch (err) {
      console.error('Failed to approve dealer', err);
    }
  };

  return (
    <>
      <LoadingProgress isLoading={isLoading} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Dealers</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Manage registered dealer accounts, shop profiles, and approvals.
            </p>
          </div>

          <Button variant="primary" onClick={openAddForm}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Dealer
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by shop name, owner, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="w-full sm:w-64">
            <label className="mb-2 block text-sm font-medium text-neutral-700">Category</label>
            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Content Table / Empty State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : dealers.length === 0 ? (
          <EmptyState
            icon="🏪"
            title="No dealers found"
            description="Try adjusting your search criteria or add a new dealer."
            action={<Button onClick={openAddForm}>Add New Dealer</Button>}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Shop Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Owner
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Email
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Category
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Created
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {dealers.map(dealer => (
                    <tr key={dealer.id} className="transition-colors hover:bg-neutral-50/80">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-neutral-900">
                        <div className="flex items-center gap-3">
                          {dealer.logoUrl ? (
                            <img
                              src={dealer.logoUrl}
                              alt={dealer.shopName}
                              className="h-9 w-9 rounded-lg border border-neutral-200 object-contain p-0.5"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 font-bold text-primary-600">
                              {dealer.shopName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{dealer.shopName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-700">
                        {dealer.userFullName || dealer.fullName || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        {dealer.userEmail || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                          {dealer.shopCategory || 'General'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {dealer.isApproved ? (
                          <Badge status="Approved" />
                        ) : (
                          <Badge status="Pending" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                        {dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium space-x-2">
                        {!dealer.isApproved && (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleApprove(dealer.id)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEditForm(dealer)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteId(dealer.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-neutral-200 px-6 py-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={newPage => setPage(newPage)}
                />
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Dealer"
          description="Are you sure you want to delete this dealer? This action cannot be undone and will remove the shop profile and associated user account."
          variant="danger"
          isLoading={isDeleting}
        />

        {/* BEAUTIFUL ADD / EDIT DEALER MODAL */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="" size="2xl">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
              <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 px-6 py-7 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M8 9h2m-2 4h2m4-4h2m-2 4h2M9 21v-3a3 3 0 016 0v3"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        {editId ? 'Edit Dealer' : 'Add New Dealer'}
                      </h2>

                      <p className="mt-1 text-sm text-white/75">
                        {editId
                          ? 'Update dealer account and shop information'
                          : 'Create a new dealer account and shop profile'}
                      </p>
                    </div>
                  </div>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Error */}
              {formError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0 3.75h.007M10.29 3.86l-8.1 14a2 2 0 001.73 3h16.16a2 2 0 001.73-3l-8.1-14a2 2 0 00-3.46 0z"
                    />
                  </svg>

                  <div>
                    <p className="text-sm font-semibold">Unable to save dealer</p>
                    <p className="mt-0.5 text-sm">{formError}</p>
                  </div>
                </div>
              )}

              {/* ================= OWNER INFORMATION ================= */}
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="font-semibold text-neutral-900">Owner Information</h3>

                      <p className="text-xs text-neutral-500">
                        Dealer account credentials and contact details
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <Input
                    label="Owner Full Name *"
                    value={formData.fullName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    required
                  />

                  <Input
                    label="Owner Email *"
                    type="email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="owner@example.com"
                    required
                  />

                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+880 1XXX-XXXXXX"
                  />

                  <Input
                    label={editId ? 'New Password (optional)' : 'Password *'}
                    type="password"
                    value={formData.password}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    placeholder={
                      editId ? 'Leave blank to keep current' : 'Enter secure password'
                    }
                    required={!editId}
                  />
                </div>
              </div>

              {/* ================= SHOP INFORMATION ================= */}
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M8 9h2m-2 4h2m4-4h2m-2 4h2M9 21v-3a3 3 0 016 0v3"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="font-semibold text-neutral-900">Shop Information</h3>

                      <p className="text-xs text-neutral-500">
                        Basic information about the dealer shop
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  {/* Shop Name */}
                  <Input
                    label="Shop Name *"
                    value={formData.shopName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        shopName: e.target.value,
                      })
                    }
                    placeholder="Enter shop name"
                    required
                  />

                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Shop Category <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        value={formData.shopCategory}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopCategory: e.target.value,
                          })
                        }
                        className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-10 text-sm text-neutral-800 outline-none transition-all hover:border-neutral-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
                        required
                      >
                        <option value="">Select a category</option>

                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Address */}
                  <Input
                    label="Address *"
                    value={formData.address}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter complete shop address"
                    required
                  />

                  {/* Logo URL */}
                  <div>
                    <Input
                      label="Logo URL"
                      value={formData.logoUrl}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          logoUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/logo.png"
                    />

                    {/* Logo Preview */}
                    {formData.logoUrl && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white">
                          <img
                            src={formData.logoUrl}
                            alt="Shop logo preview"
                            className="h-full w-full object-contain"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-800">Logo Preview</p>

                          <p className="text-xs text-neutral-500">
                            This logo will appear on the dealer profile.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= APPROVAL ================= */}
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  formData.isApproved
                    ? 'border-green-200 bg-green-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <label
                  htmlFor="isApproved"
                  className="flex cursor-pointer items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        formData.isApproved
                          ? 'bg-green-100 text-green-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {formData.isApproved ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m0 3.75h.007M10.29 3.86l-8.1 14a2 2 0 001.73 3h16.16a2 2 0 001.73-3l-8.1-14a2 2 0 00-3.46 0z"
                          />
                        </svg>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formData.isApproved ? 'Dealer Approved' : 'Dealer Pending Approval'}
                      </p>

                      <p className="mt-0.5 text-xs text-neutral-600">
                        {formData.isApproved
                          ? 'This dealer is visible to the public.'
                          : 'This dealer will remain hidden from the public.'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      id="isApproved"
                      checked={formData.isApproved}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          isApproved: e.target.checked,
                        })
                      }
                      className="peer sr-only"
                    />

                    <div className="h-7 w-12 rounded-full bg-neutral-300 transition-colors peer-checked:bg-green-500" />

                    <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSaving}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-30"
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                        <path
                          className="opacity-90"
                          fill="currentColor"
                          d="M12 3a9 9 0 019 9h-3a6 6 0 00-6-6V3z"
                        />
                      </svg>

                      Saving...
                    </>
                  ) : (
                    <>
                      {editId ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}

                      {editId ? 'Update Dealer' : 'Create Dealer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default function DealersPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Dealers">
        <DealersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
