'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, Input, ImageUploadInput, LoadingProgress } from '@/components/ui';
import type { User } from '@/types';
import toast from 'react-hot-toast';

function ProfileContent() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.me();
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          avatarUrl: response.data.avatarUrl || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
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
      await authApi.updateProfile({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        newPassword: formData.newPassword || undefined,
        currentPassword: formData.newPassword ? formData.currentPassword : undefined,
      });

      // Refresh user data in auth context
      await refreshUser();

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      toast.success('Admin profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update profile');
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
            {/* Header Banner */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-neutral-200">
              <div className="relative w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200 shadow-inner overflow-hidden shrink-0">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">
                    {formData.fullName?.charAt(0).toUpperCase() || 'A'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 font-heading">
                  {user?.fullName}
                </h2>
                <p className="text-sm text-neutral-500">{user?.email}</p>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 mt-2">
                  🛡️ Platform Administrator
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="pb-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Profile Photo & Avatar
                </h3>
                <ImageUploadInput
                  label="Admin Avatar Photo"
                  value={formData.avatarUrl}
                  onChange={(val) => setFormData({ ...formData, avatarUrl: val })}
                  aspectRatio="circle"
                  fallbackIcon="👤"
                  placeholder="Paste profile image URL or upload image file..."
                  helperText="Upload an image file from your computer or provide a direct image URL."
                />
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    error={errors.fullName}
                    required
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              {/* Password Change */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Change Password</h3>
                <p className="text-sm text-neutral-500 mb-4">
                  Leave blank if you do not wish to change your password.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    error={errors.currentPassword}
                    placeholder="Enter current password"
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
                    placeholder="Re-enter new password"
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
                  Save Admin Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Admin Settings">
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
