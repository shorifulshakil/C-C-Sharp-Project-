'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { authApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { Button, Input, Card, CardBody, Spinner, ImageUploadInput } from '@/components/ui';
import toast from 'react-hot-toast';

function AccountContent() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
      setShippingAddress(user.shippingAddress || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    try {
      await authApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        shippingAddress: shippingAddress.trim() || undefined,
      });
      await refreshUser();
      setSuccess(true);
      toast.success('Account profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsPasswordLoading(true);
    try {
      await authApi.updateProfile({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200 overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-indigo-600">
              {fullName?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-heading">{fullName}</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mt-1">
            {user.role} Account
          </span>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardBody className="space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Personal & Shipping Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-xl">
                Profile updated successfully!
              </div>
            )}

            {/* Avatar Upload */}
            <ImageUploadInput
              label="Profile Photo / Avatar"
              value={avatarUrl}
              onChange={(val) => setAvatarUrl(val)}
              aspectRatio="circle"
              fallbackIcon="👤"
              placeholder="Paste profile photo URL or upload file..."
              helperText="Upload an image from your computer or paste an image URL."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email Address" type="email" value={user.email} disabled />
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
            />

            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1">
                Default Shipping Address
              </label>
              <textarea
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter street, city, postal code for fast checkout"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <Button type="submit" isLoading={isLoading}>
              Save Profile Changes
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-lg font-bold text-neutral-900">Security & Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>
            <Button type="submit" isLoading={isPasswordLoading}>
              Update Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={['Customer', 'Dealer', 'Admin']}>
      <AccountContent />
    </ProtectedRoute>
  );
}
