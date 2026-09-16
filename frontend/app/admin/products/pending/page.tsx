'use client';

import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Button,
  Spinner,
  EmptyState,
  Badge,
  Modal,
  ConfirmDialog,
  LoadingProgress,
} from '@/components/ui';
import toast from 'react-hot-toast';
import type { Product, DealerProfile, PaginatedResponse } from '@/types';

interface DealerGroup {
  dealerId: string;
  dealerName: string;
  dealerOwnerName: string;
  dealerAddress: string;
  products: Product[];
}

function PendingProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dealersMap, setDealersMap] = useState<Record<string, DealerProfile>>(
    {}
  );

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected dealer
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(
    null
  );

  // Reject dialog
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchPendingData = async () => {
    setIsLoading(true);

    try {
      const [productsRes, dealersRes] = await Promise.all([
        adminApi.getPendingProducts({
          page: 1,
          pageSize: 1000,
        }),

        adminApi.getDealers({
          page: 1,
          pageSize: 1000,
        }),
      ]);

      const productItems =
        (productsRes.data as PaginatedResponse<Product>).items || [];

      setProducts(productItems);

      const dealerItems =
        (dealersRes.data as PaginatedResponse<DealerProfile>).items || [];

      const map: Record<string, DealerProfile> = {};

      dealerItems.forEach((dealer) => {
        map[dealer.id] = dealer;
      });

      setDealersMap(map);
    } catch {
      toast.error('Failed to load pending products data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  // ==========================================
  // GROUP PRODUCTS BY DEALER
  // ==========================================
  const dealerGroups = useMemo<DealerGroup[]>(() => {
    const groupsMap: Record<string, DealerGroup> = {};

    products.forEach((product) => {
      const dealerId = product.dealerId || 'unknown';

      const profile = dealersMap[dealerId];

      if (!groupsMap[dealerId]) {
        groupsMap[dealerId] = {
          dealerId,

          dealerName:
            profile?.shopName ||
            product.dealerName ||
            product.dealer?.shopName ||
            'Unknown Shop',

          dealerOwnerName:
            profile?.userFullName ||
            profile?.fullName ||
            product.dealerOwnerName ||
            product.dealer?.userFullName ||
            'N/A',

          dealerAddress:
            profile?.address ||
            product.dealerAddress ||
            product.dealer?.address ||
            'Address not provided',

          products: [],
        };
      }

      groupsMap[dealerId].products.push(product);
    });

    return Object.values(groupsMap);
  }, [products, dealersMap]);

  // ==========================================
  // SEARCH
  // ==========================================
  const filteredDealerGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return dealerGroups;
    }

    return dealerGroups.filter(
      (group) =>
        group.dealerName.toLowerCase().includes(term) ||
        group.dealerOwnerName.toLowerCase().includes(term) ||
        group.dealerAddress.toLowerCase().includes(term)
    );
  }, [dealerGroups, search]);

  // ==========================================
  // ACTIVE DEALER
  // ==========================================
  const activeDealerGroup = useMemo(() => {
    if (!selectedDealerId) return null;

    return (
      dealerGroups.find(
        (group) => group.dealerId === selectedDealerId
      ) || null
    );
  }, [dealerGroups, selectedDealerId]);

  // ==========================================
  // APPROVE PRODUCT
  // ==========================================
  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveProduct(id);

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );

      toast.success('Product approved successfully');
    } catch {
      toast.error('Failed to approve product');
    }
  };

  // ==========================================
  // REJECT PRODUCT
  // ==========================================
  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsRejecting(true);

    try {
      await adminApi.rejectProduct(rejectId, {
        rejectionReason,
      });

      setProducts((prev) =>
        prev.filter((product) => product.id !== rejectId)
      );

      setRejectId(null);
      setRejectionReason('');

      toast.success('Product rejected');
    } catch {
      toast.error('Failed to reject product');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <LoadingProgress isLoading={isLoading} />

      <div className="space-y-6">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              {/* Header Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">

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
                    d="M12 9v3.75m0 3.75h.007M10.29 3.86l-8.1 14a2 2 0 001.73 3h16.16a2 2 0 001.73-3l-8.1-14a2 2 0 00-3.46 0z"
                  />
                </svg>

              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Pending Product Requests
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-neutral-500">
                  Review and manage products submitted by dealers
                  before making them publicly available.
                </p>
              </div>

            </div>

            {/* Pending Summary */}
            <div className="flex shrink-0 items-center gap-3">

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
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
                        d="M12 8v4l3 2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-amber-700">
                      Pending Requests
                    </p>

                    <p className="text-xl font-bold text-amber-900">
                      {products.length}
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
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
                        d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-indigo-700">
                      Dealers
                    </p>

                    <p className="text-xl font-bold text-indigo-900">
                      {dealerGroups.length}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            BEAUTIFUL SEARCH BOX
        ====================================================== */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Find Dealer
              </h3>

              <p className="mt-1 text-xs text-neutral-500">
                Search by owner name, shop name, or address
              </p>
            </div>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-medium text-primary-600 transition hover:text-primary-700"
              >
                Clear search
              </button>
            )}

          </div>

          <div className="relative mt-4">

            {/* Search Icon */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                />
              </svg>

            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dealer, shop name, owner or address..."
              className="
                h-13 w-full rounded-2xl
                border border-neutral-200
                bg-neutral-50
                py-3.5 pl-12 pr-12
                text-sm text-neutral-900
                outline-none
                transition-all
                placeholder:text-neutral-400
                hover:border-neutral-300
                focus:border-primary-500
                focus:bg-white
                focus:ring-4
                focus:ring-primary-500/10
              "
            />

            {/* Clear Button */}
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 transition hover:text-neutral-700"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200">

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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>

                </span>
              </button>
            )}

          </div>

          {/* Search Result Info */}
          <div className="mt-3 flex items-center justify-between">

            <p className="text-xs text-neutral-500">
              Showing{' '}
              <span className="font-semibold text-neutral-800">
                {filteredDealerGroups.length}
              </span>{' '}
              dealer
              {filteredDealerGroups.length !== 1 ? 's' : ''}
            </p>

            {search && (
              <p className="text-xs text-neutral-500">
                Search result for{' '}
                <span className="font-semibold text-neutral-800">
                  "{search}"
                </span>
              </p>
            )}

          </div>

        </div>


        {/* =====================================================
            LOADING
        ====================================================== */}
        {isLoading ? (

          <div className="rounded-2xl border border-neutral-200 bg-white py-20 shadow-sm">
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          </div>

        ) : filteredDealerGroups.length === 0 ? (

          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
            <EmptyState
              icon="✅"
              title={
                search
                  ? 'No matching dealers found'
                  : 'No pending product requests'
              }
              description={
                search
                  ? 'Try searching with a different dealer name, shop name, or address.'
                  : 'All dealer product requests have been reviewed.'
              }
            />
          </div>

        ) : (

          /* =====================================================
              DEALER TABLE
          ====================================================== */
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

            {/* Table Header */}
            <div className="border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white px-6 py-4">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="font-semibold text-neutral-900">
                    Dealers With Pending Requests
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    Click any dealer row to view all pending products
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">

                  <span className="h-2 w-2 rounded-full bg-amber-500" />

                  {filteredDealerGroups.length} Pending Dealers

                </span>

              </div>

            </div>


            {/* Wide Table */}
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] table-auto">

                <thead>

                  <tr className="border-b border-neutral-200 bg-neutral-50">

                    <th className="w-[25%] px-7 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Dealer Owner
                    </th>

                    <th className="w-[22%] px-7 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Shop Name
                    </th>

                    <th className="w-[30%] px-7 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Address
                    </th>

                    <th className="w-[12%] px-7 py-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Pending
                    </th>

                    <th className="w-[18%] px-7 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-neutral-100">

                  {filteredDealerGroups.map((group) => (

                    <tr
                      key={group.dealerId}
                      onClick={() =>
                        setSelectedDealerId(group.dealerId)
                      }
                      className="
                        group cursor-pointer
                        transition-all
                        hover:bg-primary-50/40
                      "
                    >

                      {/* =================================
                          OWNER
                      ================================== */}
                      <td className="px-7 py-5">

                        <div className="flex items-center gap-4">

                          <div className="
                            flex h-12 w-12 shrink-0
                            items-center justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-indigo-500 to-purple-600
                            text-base font-bold text-white
                            shadow-sm
                          ">
                            {group.dealerOwnerName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-bold text-neutral-900">
                              {group.dealerOwnerName}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Dealer Owner
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* =================================
                          SHOP
                      ================================== */}
                      <td className="px-7 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

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
                                d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M8 9h2m-2 4h2m4-4h2m-2 4h2"
                              />
                            </svg>

                          </div>

                          <div>
                            <p className="text-sm font-bold text-neutral-900">
                              {group.dealerName}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Shop
                            </p>
                          </div>

                        </div>

                      </td>


                      {/* =================================
                          ADDRESS
                      ================================== */}
                      <td className="px-7 py-5">

                        <div className="flex items-start gap-3">

                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.8}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12z"
                              />

                              <circle
                                cx="12"
                                cy="9"
                                r="2.5"
                              />
                            </svg>

                          </div>

                          {/* NO TRUNCATE - SHOW FULL DATA */}
                          <p className="whitespace-normal break-words text-sm leading-6 text-neutral-700">
                            {group.dealerAddress}
                          </p>

                        </div>

                      </td>


                      {/* =================================
                          PENDING COUNT
                      ================================== */}
                      <td className="px-7 py-5 text-center">

                        <div className="flex flex-col items-center">

                          <span className="
                            inline-flex min-w-[70px]
                            items-center justify-center
                            rounded-xl
                            border border-amber-200
                            bg-amber-50
                            px-3 py-2
                            text-sm font-bold
                            text-amber-700
                          ">
                            {group.products.length}
                          </span>

                          <span className="mt-1 text-[11px] font-medium text-neutral-400">
                            {group.products.length === 1
                              ? 'Request'
                              : 'Requests'}
                          </span>

                        </div>

                      </td>


                      {/* =================================
                          ACTION
                      ================================== */}
                      <td className="px-7 py-5 text-right">

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDealerId(group.dealerId);
                          }}
                        >
                          <span className="flex items-center gap-2">

                            View Requests

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
                                d="M9 5l7 7-7 7"
                              />
                            </svg>

                          </span>
                        </Button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Table Footer */}
            <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3">

              <div className="flex items-center justify-between">

                <p className="text-xs text-neutral-500">
                  Total pending products:{' '}
                  <span className="font-bold text-neutral-800">
                    {products.length}
                  </span>
                </p>

                <p className="text-xs text-neutral-400">
                  Scroll horizontally to view all columns
                </p>

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            DEALER REQUEST DETAIL MODAL
        ====================================================== */}
        {activeDealerGroup && (

          <Modal
            isOpen={!!activeDealerGroup}
            onClose={() => setSelectedDealerId(null)}
            title={`Pending Requests — ${activeDealerGroup.dealerName}`}
            size="5xl"
          >

            <div className="space-y-6">

              {/* =============================================
                  DEALER OVERVIEW
              ============================================== */}
              <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">

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
                        d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14"
                      />
                    </svg>

                  </div>

                  <div>

                    <h3 className="font-bold text-neutral-900">
                      Dealer Information
                    </h3>

                    <p className="text-xs text-neutral-500">
                      Complete dealer information and pending request summary
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  {/* Owner */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">

                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Dealer Owner
                    </p>

                    <p className="mt-2 break-words text-sm font-bold text-neutral-900">
                      {activeDealerGroup.dealerOwnerName}
                    </p>

                  </div>


                  {/* Shop */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">

                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Shop Name
                    </p>

                    <p className="mt-2 break-words text-sm font-bold text-neutral-900">
                      {activeDealerGroup.dealerName}
                    </p>

                  </div>


                  {/* Pending */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      Pending Requests
                    </p>

                    <p className="mt-2 text-2xl font-bold text-amber-800">
                      {activeDealerGroup.products.length}
                    </p>

                  </div>

                </div>


                {/* Full Address */}
                <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Dealer Address
                  </p>

                  <p className="mt-2 break-words text-sm leading-6 text-neutral-700">
                    {activeDealerGroup.dealerAddress}
                  </p>

                </div>

              </div>


              {/* =============================================
                  PRODUCTS
              ============================================== */}
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">

                <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <h3 className="font-bold text-neutral-900">
                        Product Approval Requests
                      </h3>

                      <p className="mt-1 text-xs text-neutral-500">
                        Review each product and approve or reject it.
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      {activeDealerGroup.products.length} Pending
                    </span>

                  </div>

                </div>


                {/* Product Table */}
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[950px]">

                    <thead>

                      <tr className="border-b border-neutral-200 bg-white">

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Product Name
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Category
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Price
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-neutral-100">

                      {activeDealerGroup.products.map((product) => (

                        <tr
                          key={product.id}
                          className="transition hover:bg-neutral-50"
                        >

                          {/* Product */}
                          <td className="px-5 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

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
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                                  />
                                </svg>

                              </div>

                              <p className="max-w-[300px] break-words text-sm font-bold text-neutral-900">
                                {product.name}
                              </p>

                            </div>

                          </td>


                          {/* Category */}
                          <td className="px-5 py-5">

                            <span className="inline-flex rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                              {product.categoryName || 'General'}
                            </span>

                          </td>


                          {/* Price */}
                          <td className="px-5 py-5">

                            <span className="text-base font-bold text-neutral-900">
                              ${product.price.toFixed(2)}
                            </span>

                          </td>


                          {/* Status */}
                          <td className="px-5 py-5">

                            <Badge status={product.approvalStatus} />

                          </td>


                          {/* Actions */}
                          <td className="px-5 py-5">

                            <div className="flex items-center justify-end gap-2">

                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  handleApprove(product.id)
                                }
                              >
                                <span className="flex items-center gap-1.5">

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

                                  Approve

                                </span>
                              </Button>


                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setRejectId(product.id);
                                  setRejectionReason('');
                                }}
                              >
                                <span className="flex items-center gap-1.5">

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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>

                                  Reject

                                </span>
                              </Button>

                            </div>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>


                {/* Modal Table Footer */}
                <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-4">

                  <div className="flex items-center justify-between">

                    <p className="text-xs text-neutral-500">
                      Total:{' '}
                      <span className="font-bold text-neutral-800">
                        {activeDealerGroup.products.length}
                      </span>{' '}
                      pending product requests
                    </p>

                  </div>

                </div>

              </div>


              {/* Close */}
              <div className="flex justify-end border-t border-neutral-200 pt-5">

                <Button
                  variant="outline"
                  onClick={() => setSelectedDealerId(null)}
                >
                  Close
                </Button>

              </div>

            </div>

          </Modal>

        )}


        {/* =====================================================
            REJECTION DIALOG
        ====================================================== */}
        <ConfirmDialog
          isOpen={!!rejectId}
          onClose={() => setRejectId(null)}
          onConfirm={handleReject}
          title="Reject Product Request"
          description={
            <div className="space-y-3">

              <div className="rounded-xl border border-red-200 bg-red-50 p-3">

                <p className="text-sm font-medium text-red-700">
                  Please provide a clear reason for rejecting
                  this product request.
                </p>

              </div>

              <textarea
                className="
                  w-full resize-none rounded-xl
                  border border-neutral-200
                  bg-neutral-50
                  p-3.5
                  text-sm text-neutral-900
                  outline-none
                  transition
                  placeholder:text-neutral-400
                  hover:border-neutral-300
                  focus:border-red-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-red-500/10
                "
                rows={4}
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(e.target.value)
                }
                placeholder="Enter rejection reason..."
              />

              <p className="text-xs text-neutral-400">
                The rejection reason will be associated with this
                product request.
              </p>

            </div>
          }
          confirmText="Reject Product"
          isLoading={isRejecting}
        />

      </div>
    </>
  );
}


// ============================================================
// PAGE
// ============================================================
export default function PendingProductsPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>

      <DashboardLayout
        allowedRoles={['Admin']}
        title="Pending Products"
      >

        <PendingProductsContent />

      </DashboardLayout>

    </ProtectedRoute>
  );
}
