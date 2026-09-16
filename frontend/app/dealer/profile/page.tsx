'use client';

import { useState, useEffect } from 'react';
import { dealerApi, authApi } from '@/services/api';
import { useAuth } from '@/features/auth';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Button,
  Spinner,
  Input,
  ImageUploadInput,
  LoadingProgress,
} from '@/components/ui';
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

  // ============================================================
  // FETCH PROFILE
  // ============================================================
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
          avatarUrl:
            data.avatarUrl ||
            authUser?.avatarUrl ||
            '',
          fullName:
            data.userFullName ||
            authUser?.fullName ||
            '',
          phone:
            data.userPhone ||
            authUser?.phone ||
            '',
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

  // ============================================================
  // VALIDATION
  // ============================================================
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
      newErrors.fullName =
        'Owner Full Name is required';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword =
          'Current password is required to change password';
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword =
          'New password must be at least 6 characters';
      }

      if (
        formData.newPassword !==
        formData.confirmPassword
      ) {
        newErrors.confirmPassword =
          'Passwords do not match';
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    try {
      // --------------------------------------------------------
      // 1. UPDATE DEALER SHOP DETAILS
      // --------------------------------------------------------
      const response =
        await dealerApi.updateProfile({
          shopName: formData.shopName.trim(),
          shopDescription:
            formData.shopDescription.trim(),
          shopCategory:
            formData.shopCategory.trim(),
          address: formData.address.trim(),
          logoUrl: formData.logoUrl.trim(),
          avatarUrl: formData.avatarUrl.trim(),
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
        });

      setProfile(
        response.data as DealerProfile
      );

      // --------------------------------------------------------
      // 2. UPDATE PASSWORD IF REQUESTED
      // --------------------------------------------------------
      if (formData.newPassword) {
        await authApi.updateProfile({
          fullName: formData.fullName.trim(),
          phone:
            formData.phone.trim() || undefined,
          avatarUrl:
            formData.avatarUrl.trim() || undefined,
          newPassword: formData.newPassword,
          currentPassword:
            formData.currentPassword,
        });
      }

      // --------------------------------------------------------
      // 3. REFRESH USER
      // --------------------------------------------------------
      await refreshUser();

      // --------------------------------------------------------
      // 4. CLEAR PASSWORD FIELDS
      // --------------------------------------------------------
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setErrors({});

      toast.success(
        'Shop Settings updated successfully!'
      );
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        error.response?.data?.message ||
          'Failed to update shop settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  return (
    <>
      <LoadingProgress isLoading={isLoading} />

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl space-y-6">

          {/* ==================================================
              PAGE HEADER
          =================================================== */}
          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              border border-neutral-200
              bg-white
              shadow-sm
            "
          >

            {/* Decorative Background */}
            <div
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20
                h-64
                w-64
                rounded-full
                bg-purple-100/60
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-20
                h-56
                w-56
                rounded-full
                bg-indigo-100/50
                blur-3xl
              "
            />

            <div className="relative p-6 sm:p-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Shop Logo */}
                <div
                  className="
                    relative
                    flex
                    h-24
                    w-24
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-3xl
                    border
                    border-purple-100
                    bg-gradient-to-br
                    from-purple-50
                    to-indigo-50
                    shadow-inner
                  "
                >

                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt={
                        formData.shopName ||
                        'Shop Logo'
                      }
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <span className="text-4xl">
                      🏪
                    </span>
                  )}

                </div>


                {/* Shop Info */}
                <div className="min-w-0 flex-1">

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-3
                    "
                  >

                    <h1
                      className="
                        break-words
                        text-2xl
                        font-bold
                        tracking-tight
                        text-neutral-900
                        sm:text-3xl
                      "
                    >
                      {profile?.shopName ||
                        'My Shop'}
                    </h1>


                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          profile?.isApproved
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }
                      `}
                    >

                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${
                            profile?.isApproved
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }
                        `}
                      />

                      {profile?.isApproved
                        ? 'Approved Dealer'
                        : 'Pending Approval'}

                    </span>

                  </div>


                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-neutral-500
                    "
                  >
                    Manage your shop information,
                    branding, owner details and
                    account security.
                  </p>


                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-2
                      text-sm
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-neutral-600
                      "
                    >

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="
                          h-4
                          w-4
                          text-purple-500
                        "
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

                      <span>
                        {profile?.userFullName ||
                          authUser?.fullName ||
                          'Owner'}
                      </span>

                    </div>


                    <div
                      className="
                        hidden
                        h-4
                        w-px
                        bg-neutral-200
                        sm:block
                      "
                    />


                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        break-all
                        text-neutral-500
                      "
                    >

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-purple-500
                        "
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l9 6 9-6"
                        />

                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                      </svg>

                      {profile?.userEmail ||
                        authUser?.email ||
                        'No email'}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              MAIN FORM
          =================================================== */}
          <div
            className="
              overflow-hidden
              rounded-3xl
              border border-neutral-200
              bg-white
              shadow-sm
            "
          >

            <form
              onSubmit={handleSubmit}
              className="space-y-0"
            >

              {/* ==================================================
                  BRANDING SECTION
              =================================================== */}
              <section
                className="
                  border-b
                  border-neutral-200
                  p-6
                  sm:p-8
                "
              >

                <div className="mb-6 flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-purple-50
                      text-purple-600
                    "
                  >

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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 14l1.586-1.586a2 2 0 012.828 0L20 14"
                      />

                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                      />

                      <circle
                        cx="8.5"
                        cy="8.5"
                        r="1.5"
                      />
                    </svg>

                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-neutral-900
                      "
                    >
                      Branding & Photos
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-neutral-500
                      "
                    >
                      Add your shop logo and
                      owner profile photo.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-2
                  "
                >

                  <ImageUploadInput
                    label="Shop Logo *"
                    value={formData.logoUrl}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        logoUrl: val,
                      })
                    }
                    aspectRatio="square"
                    fallbackIcon="🏪"
                    placeholder="Paste shop logo URL or upload image file..."
                    helperText="Upload your store logo or provide a direct image URL."
                  />


                  <ImageUploadInput
                    label="Owner Profile Photo"
                    value={formData.avatarUrl}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        avatarUrl: val,
                      })
                    }
                    aspectRatio="circle"
                    fallbackIcon="👤"
                    placeholder="Paste profile photo URL or upload image file..."
                    helperText="Upload your personal photo or provide a direct image URL."
                  />

                </div>

              </section>


              {/* ==================================================
                  SHOP INFORMATION
              =================================================== */}
              <section
                className="
                  border-b
                  border-neutral-200
                  p-6
                  sm:p-8
                "
              >

                <div className="mb-7 flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-50
                      text-indigo-600
                    "
                  >

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

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 9h2M8 13h2M14 9h2M14 13h2"
                      />
                    </svg>

                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-neutral-900
                      "
                    >
                      Shop Information
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-neutral-500
                      "
                    >
                      Keep your business information
                      accurate and up to date.
                    </p>

                  </div>

                </div>


                <div className="space-y-6">

                  {/* ==================================================
                      BEAUTIFUL SHOP NAME INPUT
                  =================================================== */}
                  <div className="group">

                    {/* Label */}
                    <label
                      htmlFor="shopName"
                      className="
                        mb-2.5
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        text-neutral-800
                      "
                    >

                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-purple-50
                          text-purple-600
                          transition-all
                          duration-200
                          group-focus-within:bg-purple-100
                          group-focus-within:text-purple-700
                        "
                      >

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 21h18"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 9h2M8 13h2M14 9h2M14 13h2"
                          />
                        </svg>

                      </span>


                      <span>
                        Shop Name
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </span>

                    </label>


                    {/* Input Wrapper */}
                    <div className="relative">

                      {/* Left Icon */}
                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-y-0
                          left-0
                          z-10
                          flex
                          items-center
                          pl-4
                        "
                      >

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="
                            h-5
                            w-5
                            text-neutral-400
                            transition-all
                            duration-200
                            group-focus-within:scale-105
                            group-focus-within:text-purple-600
                          "
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 21h18"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 9h2M8 13h2M14 9h2M14 13h2"
                          />

                        </svg>

                      </div>


                      {/* Input */}
                      <input
                        id="shopName"
                        name="shopName"
                        type="text"
                        value={formData.shopName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            shopName: e.target.value,
                          });

                          if (errors.shopName) {
                            setErrors((prev) => ({
                              ...prev,
                              shopName: '',
                            }));
                          }
                        }}
                        placeholder="Enter your official shop name"
                        autoComplete="organization"
                        required
                        className={`
                          h-14
                          w-full
                          rounded-xl
                          border
                          bg-neutral-50
                          py-3.5
                          pl-12
                          pr-14
                          text-sm
                          font-medium
                          text-neutral-900
                          outline-none
                          transition-all
                          duration-200

                          placeholder:font-normal
                          placeholder:text-neutral-400

                          hover:bg-white

                          focus:bg-white
                          focus:ring-4

                          ${
                            errors.shopName
                              ? `
                                border-red-400
                                focus:border-red-500
                                focus:ring-red-500/10
                              `
                              : `
                                border-neutral-200
                                hover:border-neutral-300
                                focus:border-purple-500
                                focus:ring-purple-500/10
                              `
                          }
                        `}
                      />


                      {/* Success / Error Icon */}
                      {formData.shopName.trim().length >
                        0 && (
                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-y-0
                            right-0
                            flex
                            items-center
                            pr-4
                          "
                        >

                          <div
                            className={`
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center
                              rounded-full
                              ${
                                errors.shopName
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }
                            `}
                          >

                            {errors.shopName ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}

                          </div>

                        </div>
                      )}

                    </div>


                    {/* Error */}
                    {errors.shopName ? (
                      <p
                        className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                          px-1
                          text-xs
                          font-medium
                          text-red-500
                        "
                      >

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.5m0 3.5h.01"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                          />
                        </svg>

                        {errors.shopName}

                      </p>
                    ) : (
                      <p
                        className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                          px-1
                          text-xs
                          text-neutral-400
                        "
                      >

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 11v5m0-8h.01"
                          />
                        </svg>

                        Enter the official name of
                        your shop or business.

                      </p>
                    )}

                  </div>


                  {/* ==================================================
                      CATEGORY
                  =================================================== */}
                  <div>

                    <label
                      htmlFor="shopCategory"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-neutral-800
                      "
                    >
                      Shop Category
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-y-0
                          left-0
                          z-10
                          flex
                          items-center
                          pl-4
                        "
                      >

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="
                            h-5
                            w-5
                            text-neutral-400
                          "
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>

                      </div>


                      <input
                        id="shopCategory"
                        type="text"
                        value={formData.shopCategory}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            shopCategory:
                              e.target.value,
                          });

                          if (errors.shopCategory) {
                            setErrors((prev) => ({
                              ...prev,
                              shopCategory: '',
                            }));
                          }
                        }}
                        placeholder="e.g. Electronics, Clothing, General"
                        className={`
                          h-14
                          w-full
                          rounded-xl
                          border
                          bg-neutral-50
                          py-3.5
                          pl-12
                          pr-4
                          text-sm
                          font-medium
                          text-neutral-900
                          outline-none
                          transition-all

                          placeholder:font-normal
                          placeholder:text-neutral-400

                          hover:border-neutral-300
                          hover:bg-white

                          focus:bg-white
                          focus:ring-4

                          ${
                            errors.shopCategory
                              ? `
                                border-red-400
                                focus:border-red-500
                                focus:ring-red-500/10
                              `
                              : `
                                border-neutral-200
                                focus:border-purple-500
                                focus:ring-purple-500/10
                              `
                          }
                        `}
                        required
                      />

                    </div>

                    {errors.shopCategory && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {errors.shopCategory}
                      </p>
                    )}

                  </div>


                  {/* ==================================================
                      ADDRESS
                  =================================================== */}
                  <div>

                    <label
                      htmlFor="shopAddress"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-neutral-800
                      "
                    >
                      Shop Address
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>


                    <div className="relative">

                      <div
                        className="
                          pointer-events-none
                          absolute
                          left-0
                          top-4
                          z-10
                          flex
                          pl-4
                        "
                      >

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="
                            h-5
                            w-5
                            text-neutral-400
                          "
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"
                          />

                          <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                          />
                        </svg>

                      </div>


                      <textarea
                        id="shopAddress"
                        rows={3}
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          });

                          if (errors.address) {
                            setErrors((prev) => ({
                              ...prev,
                              address: '',
                            }));
                          }
                        }}
                        placeholder="Enter your complete shop address"
                        className={`
                          min-h-[110px]
                          w-full
                          resize-y
                          rounded-xl
                          border
                          bg-neutral-50
                          py-3.5
                          pl-12
                          pr-4
                          text-sm
                          font-medium
                          leading-6
                          text-neutral-900
                          outline-none
                          transition-all

                          placeholder:font-normal
                          placeholder:text-neutral-400

                          hover:border-neutral-300
                          hover:bg-white

                          focus:bg-white
                          focus:ring-4

                          ${
                            errors.address
                              ? `
                                border-red-400
                                focus:border-red-500
                                focus:ring-red-500/10
                              `
                              : `
                                border-neutral-200
                                focus:border-purple-500
                                focus:ring-purple-500/10
                              `
                          }
                        `}
                        required
                      />

                    </div>


                    {errors.address && (
                      <p
                        className="
                          mt-2
                          text-xs
                          font-medium
                          text-red-500
                        "
                      >
                        {errors.address}
                      </p>
                    )}

                  </div>


                  {/* ==================================================
                      DESCRIPTION
                  =================================================== */}
                  <div>

                    <label
                      htmlFor="shopDescription"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-neutral-800
                      "
                    >
                      Shop Description
                    </label>


                    <textarea
                      id="shopDescription"
                      rows={4}
                      value={formData.shopDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shopDescription:
                            e.target.value,
                        })
                      }
                      placeholder="Describe your products, services, warranty policies, or anything customers should know about your shop..."
                      className="
                        min-h-[130px]
                        w-full
                        resize-y
                        rounded-xl
                        border
                        border-neutral-200
                        bg-neutral-50
                        px-4
                        py-3.5
                        text-sm
                        font-medium
                        leading-6
                        text-neutral-900
                        outline-none
                        transition-all

                        placeholder:font-normal
                        placeholder:text-neutral-400

                        hover:border-neutral-300
                        hover:bg-white

                        focus:border-purple-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-purple-500/10
                      "
                    />

                    <p
                      className="
                        mt-2
                        px-1
                        text-xs
                        text-neutral-400
                      "
                    >
                      A clear description helps
                      customers understand your
                      business.
                    </p>

                  </div>

                </div>

              </section>


              {/* ==================================================
                  OWNER DETAILS
              =================================================== */}
              <section
                className="
                  border-b
                  border-neutral-200
                  p-6
                  sm:p-8
                "
              >

                <div className="mb-7 flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-blue-600
                    "
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 20a7.5 7.5 0 0115 0"
                      />
                    </svg>

                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-neutral-900
                      "
                    >
                      Owner Details
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-neutral-500
                      "
                    >
                      Update your personal contact
                      information.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    md:grid-cols-2
                  "
                >

                  <Input
                    label="Owner Full Name *"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        fullName:
                          e.target.value,
                      });

                      if (errors.fullName) {
                        setErrors((prev) => ({
                          ...prev,
                          fullName: '',
                        }));
                      }
                    }}
                    error={errors.fullName}
                    placeholder="Enter your full name"
                    required
                  />


                  <Input
                    label="Owner Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+880 1XXX-XXXXXX"
                  />

                </div>

              </section>


              {/* ==================================================
                  SECURITY
              =================================================== */}
              <section
                className="
                  border-b
                  border-neutral-200
                  p-6
                  sm:p-8
                "
              >

                <div className="mb-7 flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-amber-50
                      text-amber-600
                    "
                  >

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="10"
                        rx="2"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10V7a4 4 0 018 0v3"
                      />

                      <circle
                        cx="12"
                        cy="15"
                        r="1"
                      />
                    </svg>

                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-neutral-900
                      "
                    >
                      Security & Password
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-neutral-500
                      "
                    >
                      Change your password securely.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    mb-6
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-amber-200
                    bg-amber-50
                    p-4
                  "
                >

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-amber-600
                    "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.5m0 3.5h.01"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                  </svg>


                  <p
                    className="
                      text-xs
                      leading-5
                      text-amber-800
                    "
                  >
                    Leave all password fields empty
                    if you do not want to change your
                    current password.
                  </p>

                </div>


                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    md:grid-cols-3
                  "
                >

                  <Input
                    label="Current Password"
                    type="password"
                    value={
                      formData.currentPassword
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword:
                          e.target.value,
                      })
                    }
                    error={
                      errors.currentPassword
                    }
                    placeholder="Current password"
                  />


                  <Input
                    label="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newPassword:
                          e.target.value,
                      })
                    }
                    error={errors.newPassword}
                    placeholder="Minimum 6 characters"
                  />


                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                    error={
                      errors.confirmPassword
                    }
                    placeholder="Confirm password"
                  />

                </div>

              </section>


              {/* ==================================================
                  SAVE FOOTER
              =================================================== */}
              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  bg-neutral-50/70
                  p-6
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:p-8
                "
              >

                <div className="text-xs text-neutral-500">

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        h-2
                        w-2
                        rounded-full
                        bg-emerald-500
                      "
                    />

                    Your changes are saved
                    securely.

                  </div>

                </div>


                <div
                  className="
                    flex
                    w-full
                    flex-col-reverse
                    gap-3
                    sm:w-auto
                    sm:flex-row
                  "
                >

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      window.location.reload()
                    }
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>


                  <Button
                    type="submit"
                    isLoading={isSaving}
                  >
                    <span className="flex items-center gap-2">

                      {!isSaving && (
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
                      )}

                      Save Shop & Profile Settings

                    </span>
                  </Button>

                </div>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}


// ============================================================
// PAGE
// ============================================================
export default function DealerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout
        allowedRoles={['Dealer']}
        title="Shop Settings & Profile"
      >
        <DealerProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
