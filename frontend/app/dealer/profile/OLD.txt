'use client';

import { useState, useEffect } from 'react';
import { dealerApi, authApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, Input, ImageUploadInput, LoadingProgress } from '@/components/ui';
import type { DealerProfile } from '@/types';
import toast from 'react-hot-toast';

function DealerProfileContent() {
  const { user: authUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    shopCategory: '',
    address: '',
    logoUrl: '',
    avatarUrl: '',
    fullName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await dealerApi.getProfile();
        const data = response.data as DealerProfile;
        setProfile(data);
        setFormData({
          shopName: data.shopName || '',
          shopDescription: data.shopDescription || '',
          shopCategory: data.shopCategory || 'General',
          address: data.address || '',
          logoUrl: data.logoUrl || '',
          avatarUrl: data.avatarUrl || authUser?.avatarUrl || '',
          fullName: data.userFullName || authUser?.fullName || '',
          phone: data.userPhone || authUser?.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch {
        toast.error('Failed to load dealer profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [authUser]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop Name is required';
    }
    if (!formData.shopCategory.trim()) {
      newErrors.shopCategory = 'Shop Category is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Owner Full Name is required';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      // 1. Update Dealer Shop Details
      const response = await dealerApi.updateProfile({
        shopName: formData.shopName.trim(),
        shopDescription: formData.shopDescription.trim(),
        shopCategory: formData.shopCategory.trim(),
        address: formData.address.trim(),
        logoUrl: formData.logoUrl.trim(),
        avatarUrl: formData.avatarUrl.trim(),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });
      setProfile(response.data as DealerProfile);

      // 2. If password change is requested, update auth profile
      if (formData.newPassword) {
        await authApi.updateProfile({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim() || undefined,
          avatarUrl: formData.avatarUrl.trim() || undefined,
          newPassword: formData.newPassword,
          currentPassword: formData.currentPassword,
        });
      }

      await refreshUser();

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      toast.success('Shop Settings updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update shop settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <LoadingProgress isLoading={isLoading} />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            {/* Header / Banner */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-neutral-200">
              <div className="relative w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center border border-indigo-200 shadow-inner overflow-hidden shrink-0">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt={formData.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🏪</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-neutral-900 font-heading">
                    {profile?.shopName || 'My Shop'}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      profile?.isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {profile?.isApproved ? 'Approved Dealer' : 'Pending Approval'}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Owner: <span className="font-semibold text-neutral-800">{profile?.userFullName || authUser?.fullName}</span> ({profile?.userEmail || authUser?.email})
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Media Section: Avatar & Logo */}
              <div className="space-y-6 pb-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Branding & Photos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shop Logo */}
                  <ImageUploadInput
                    label="Shop Logo *"
                    value={formData.logoUrl}
                    onChange={(val) => setFormData({ ...formData, logoUrl: val })}
                    aspectRatio="square"
                    fallbackIcon="🏪"
                    placeholder="Paste shop logo URL or upload image file..."
                    helperText="Upload your store logo or provide a direct image URL."
                  />

                  {/* Owner Profile Photo */}
                  <ImageUploadInput
                    label="Owner Profile Photo"
                    value={formData.avatarUrl}
                    onChange={(val) => setFormData({ ...formData, avatarUrl: val })}
                    aspectRatio="circle"
                    fallbackIcon="👤"
                    placeholder="Paste profile photo URL or upload image file..."
                    helperText="Upload your personal photo or provide a direct image URL."
                  />
                </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-4 pb-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Shop Information
                </h3>

                <Input
                  label="Shop Name *"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  error={errors.shopName}
                  placeholder="Enter your official shop name"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Shop Category *
                    </label>
                    <input
                      type="text"
                      value={formData.shopCategory}
                      onChange={(e) =>
                        setFormData({ ...formData, shopCategory: e.target.value })
                      }
                      placeholder="e.g. Electronics, Clothing, General"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    />
                    {errors.shopCategory && (
                      <p className="mt-1 text-xs text-red-500">{errors.shopCategory}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">
                    Shop Address *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter shop address"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">
                    Shop Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.shopDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shopDescription: e.target.value })
                    }
                    placeholder="Describe products, services, or warranty policies offered by your shop"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-4 pb-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Owner Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Owner Full Name *"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    error={errors.fullName}
                    required
                  />
                  <Input
                    label="Owner Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              {/* Security & Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Security & Password
                </h3>
                <p className="text-xs text-neutral-500">Leave password fields empty to keep current password.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    error={errors.currentPassword}
                    placeholder="Current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    error={errors.newPassword}
                    placeholder="Min 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    error={errors.confirmPassword}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save Shop & Profile Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function DealerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="Shop Settings & Profile">
        <DealerProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
