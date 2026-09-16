'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { dealerApi, publicApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import {
  Button,
  Input,
  Card,
  CardBody,
  CardFooter,
  ImageUploadInput,
} from '@/components/ui';

import type { Category } from '@/types';

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    sku: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoryLoading(true);

        const response = await publicApi.getCategories();

        setCategories(response.data);
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setIsCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ============================================================
  // UPDATE FIELD
  // ============================================================
  const updateField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
      newErrors.price =
        'Price must be greater than 0';
    }

    if (
      formData.stockQuantity === '' ||
      Number(formData.stockQuantity) < 0
    ) {
      newErrors.stockQuantity =
        'Stock must be 0 or greater';
    }

    if (!formData.categoryId) {
      newErrors.categoryId =
        'Category is required';
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

    if (!validate()) {
      toast.error(
        'Please fix the highlighted fields'
      );
      return;
    }

    setIsLoading(true);

    try {
      await dealerApi.createProduct({
        name: formData.name.trim(),

        description:
          formData.description.trim() ||
          undefined,

        price: Number(formData.price),

        stockQuantity:
          Number(formData.stockQuantity),

        categoryId: formData.categoryId,

        sku:
          formData.sku.trim() ||
          undefined,

        images: formData.imageUrl.trim()
          ? [
              {
                imageUrl:
                  formData.imageUrl.trim(),
                displayOrder: 0,
              },
            ]
          : undefined,
      });

      toast.success(
        'Product created successfully!'
      );

      router.push('/dealer/products');
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
          'Failed to create product'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout
        allowedRoles={['Dealer']}
        title="New Product"
      >

        <div className="mx-auto w-full max-w-6xl">

          {/* ==================================================
              PAGE HEADER
          =================================================== */}
          <div className="mb-8">

            <div className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-end
              sm:justify-between
            ">

              <div>

                <div className="
                  mb-3
                  flex
                  items-center
                  gap-2.5
                ">

                  <span className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-indigo-50
                    text-indigo-600
                  ">
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
                  </span>

                  <span className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-indigo-600
                  ">
                    Product Management
                  </span>

                </div>

                <h1 className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  sm:text-4xl
                ">
                  Add New Product
                </h1>

                <p className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                  sm:text-base
                ">
                  Add your product information,
                  pricing, inventory and images
                  to publish it in your store.
                </p>

              </div>

              <button
                type="button"
                onClick={() => router.back()}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-slate-600
                  shadow-sm
                  transition-all
                  hover:border-slate-300
                  hover:bg-slate-50
                  hover:text-slate-900
                "
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>

                Back to Products
              </button>

            </div>

          </div>


          {/* ==================================================
              MAIN CARD
          =================================================== */}
          <Card className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-xl
            shadow-slate-200/50
          ">

            {/* CARD HEADER */}
            <div className="
              border-b
              border-slate-100
              bg-gradient-to-r
              from-indigo-50/70
              via-white
              to-blue-50/50
              px-6
              py-6
              sm:px-8
            ">

              <div className="flex items-center gap-4">

                <div className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-600
                  text-white
                  shadow-lg
                  shadow-indigo-500/20
                ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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

                <div>

                  <h2 className="
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                    Product Details
                  </h2>

                  <p className="
                    mt-1
                    text-sm
                    text-slate-500
                  ">
                    Complete the information below
                    to create your product listing.
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                FORM BODY
            =================================================== */}
            <CardBody className="
              p-6
              sm:p-8
              lg:p-10
            ">

              <form
                id="create-product-form"
                onSubmit={handleSubmit}
                className="space-y-10"
              >

                {/* ==================================================
                    BASIC INFORMATION
                =================================================== */}
                <section>

                  <div className="
                    mb-6
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-50
                      text-indigo-600
                    ">
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
                          d="M4 6h16M4 12h10M4 18h7"
                        />
                      </svg>
                    </div>

                    <div>

                      <h3 className="
                        text-base
                        font-bold
                        text-slate-900
                      ">
                        Basic Information
                      </h3>

                      <p className="
                        text-xs
                        text-slate-500
                      ">
                        Name and description of your
                        product.
                      </p>

                    </div>

                  </div>


                  {/* PRODUCT NAME */}
                  <Input
                    label="Product Name *"
                    value={formData.name}
                    onChange={(e) =>
                      updateField(
                        'name',
                        e.target.value
                      )
                    }
                    error={errors.name}
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                    required
                  />


                  {/* DESCRIPTION */}
                  <div className="mt-6">

                    <label
                      htmlFor="description"
                      className="
                        mb-2
                        block
                        text-sm
                        font-semibold
                        text-slate-800
                      "
                    >
                      Product Description
                    </label>

                    <textarea
                      id="description"
                      rows={5}
                      value={formData.description}
                      onChange={(e) =>
                        updateField(
                          'description',
                          e.target.value
                        )
                      }
                      placeholder="Describe your product, key features, specifications, warranty information, etc..."
                      className="
                        min-h-[140px]
                        w-full
                        resize-y
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50/70
                        px-4
                        py-3.5
                        text-sm
                        font-medium
                        leading-6
                        text-slate-900
                        outline-none
                        transition-all
                        placeholder:font-normal
                        placeholder:text-slate-400
                        hover:border-slate-300
                        hover:bg-white
                        focus:border-indigo-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-500/10
                      "
                    />

                    <p className="
                      mt-2
                      text-xs
                      text-slate-400
                    ">
                      Add important features,
                      specifications and warranty
                      information.
                    </p>

                  </div>

                </section>


                <div className="h-px bg-slate-100" />


                {/* ==================================================
                    PRICING & INVENTORY
                =================================================== */}
                <section>

                  <div className="
                    mb-6
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-600
                    ">
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
                          d="M12 3v18M17 7H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H6"
                        />
                      </svg>
                    </div>

                    <div>

                      <h3 className="
                        text-base
                        font-bold
                        text-slate-900
                      ">
                        Pricing & Inventory
                      </h3>

                      <p className="
                        text-xs
                        text-slate-500
                      ">
                        Set your selling price and
                        available stock.
                      </p>

                    </div>

                  </div>


                  <div className="
                    grid
                    grid-cols-1
                    gap-6
                    md:grid-cols-2
                  ">

                    {/* ==================================================
                        PRICE INPUT
                    =================================================== */}
                    <div>

                      <label
                        htmlFor="price"
                        className="
                          mb-2.5
                          block
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        Selling Price
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>


                      <div className="relative">

                        {/* Currency */}
                        <div className="
                          absolute
                          inset-y-0
                          left-0
                          flex
                          items-center
                          pl-4
                          pointer-events-none
                        ">

                          <span className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-emerald-50
                            text-sm
                            font-bold
                            text-emerald-600
                          ">
                            $
                          </span>

                        </div>


                        <input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            updateField(
                              'price',
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          required
                          className={`
                            h-14
                            w-full
                            rounded-xl
                            border
                            bg-slate-50
                            py-3.5
                            pl-16
                            pr-4
                            text-base
                            font-semibold
                            text-slate-900
                            outline-none
                            transition-all
                            placeholder:font-normal
                            placeholder:text-slate-400
                            hover:bg-white
                            focus:bg-white
                            focus:ring-4

                            ${
                              errors.price
                                ? `
                                  border-red-400
                                  focus:border-red-500
                                  focus:ring-red-500/10
                                `
                                : `
                                  border-slate-200
                                  focus:border-emerald-500
                                  focus:ring-emerald-500/10
                                `
                            }
                          `}
                        />

                      </div>


                      {errors.price ? (
                        <p className="
                          mt-2
                          text-xs
                          font-medium
                          text-red-500
                        ">
                          {errors.price}
                        </p>
                      ) : (
                        <p className="
                          mt-2
                          text-xs
                          text-slate-400
                        ">
                          Enter the current selling price
                          of this product.
                        </p>
                      )}

                    </div>


                    {/* ==================================================
                        STOCK INPUT
                    =================================================== */}
                    <div>

                      <label
                        htmlFor="stockQuantity"
                        className="
                          mb-2.5
                          block
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        Stock Quantity
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>


                      <div className="relative">

                        <div className="
                          absolute
                          inset-y-0
                          left-0
                          flex
                          items-center
                          pl-4
                          pointer-events-none
                        ">

                          <span className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                          ">

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
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                              />
                            </svg>

                          </span>

                        </div>


                        <input
                          id="stockQuantity"
                          type="number"
                          min="0"
                          value={
                            formData.stockQuantity
                          }
                          onChange={(e) =>
                            updateField(
                              'stockQuantity',
                              e.target.value
                            )
                          }
                          placeholder="e.g. 50"
                          required
                          className={`
                            h-14
                            w-full
                            rounded-xl
                            border
                            bg-slate-50
                            py-3.5
                            pl-16
                            pr-4
                            text-base
                            font-semibold
                            text-slate-900
                            outline-none
                            transition-all
                            placeholder:font-normal
                            placeholder:text-slate-400
                            hover:bg-white
                            focus:bg-white
                            focus:ring-4

                            ${
                              errors.stockQuantity
                                ? `
                                  border-red-400
                                  focus:border-red-500
                                  focus:ring-red-500/10
                                `
                                : `
                                  border-slate-200
                                  focus:border-blue-500
                                  focus:ring-blue-500/10
                                `
                            }
                          `}
                        />

                      </div>


                      {errors.stockQuantity ? (
                        <p className="
                          mt-2
                          text-xs
                          font-medium
                          text-red-500
                        ">
                          {errors.stockQuantity}
                        </p>
                      ) : (
                        <p className="
                          mt-2
                          text-xs
                          text-slate-400
                        ">
                          Enter how many units are
                          currently available.
                        </p>
                      )}

                    </div>

                  </div>

                </section>


                <div className="h-px bg-slate-100" />


                {/* ==================================================
                    CLASSIFICATION
                =================================================== */}
                <section>

                  <div className="
                    mb-6
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-violet-50
                      text-violet-600
                    ">

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
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>

                    </div>

                    <div>

                      <h3 className="
                        text-base
                        font-bold
                        text-slate-900
                      ">
                        Classification
                      </h3>

                      <p className="
                        text-xs
                        text-slate-500
                      ">
                        Choose a category and add an
                        optional SKU.
                      </p>

                    </div>

                  </div>


                  <div className="
                    grid
                    grid-cols-1
                    gap-6
                    md:grid-cols-2
                  ">

                    {/* ==================================================
                        CATEGORY DROPDOWN
                    =================================================== */}
                    <div>

                      <label
                        htmlFor="category"
                        className="
                          mb-2.5
                          block
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        Category
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>


                      <div className="relative">

                        {/* Category Icon */}
                        <div className="
                          pointer-events-none
                          absolute
                          inset-y-0
                          left-0
                          z-10
                          flex
                          items-center
                          pl-4
                        ">

                          <span className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-violet-50
                            text-violet-600
                          ">

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
                                d="M4 6h16M4 12h16M4 18h16"
                              />
                            </svg>

                          </span>

                        </div>


                        <select
                          id="category"
                          value={
                            formData.categoryId
                          }
                          onChange={(e) =>
                            updateField(
                              'categoryId',
                              e.target.value
                            )
                          }
                          required
                          disabled={
                            isCategoryLoading
                          }
                          className={`
                            h-14
                            w-full
                            appearance-none
                            rounded-xl
                            border
                            bg-slate-50
                            px-4
                            pl-16
                            pr-12
                            text-sm
                            font-semibold
                            outline-none
                            transition-all
                            hover:bg-white
                            focus:bg-white
                            focus:ring-4

                            ${
                              errors.categoryId
                                ? `
                                  border-red-400
                                  text-slate-900
                                  focus:border-red-500
                                  focus:ring-red-500/10
                                `
                                : `
                                  border-slate-200
                                  text-slate-700
                                  focus:border-violet-500
                                  focus:ring-violet-500/10
                                `
                            }
                          `}
                        >

                          <option
                            value=""
                            disabled
                          >
                            {isCategoryLoading
                              ? 'Loading categories...'
                              : 'Select a category'}
                          </option>


                          {categories.map(
                            (category) => (
                              <option
                                key={category.id}
                                value={category.id}
                              >
                                {category.name}
                              </option>
                            )
                          )}

                        </select>


                        {/* Dropdown Arrow */}
                        <div className="
                          pointer-events-none
                          absolute
                          inset-y-0
                          right-0
                          flex
                          items-center
                          pr-4
                        ">

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>

                        </div>

                      </div>


                      {errors.categoryId ? (
                        <p className="
                          mt-2
                          text-xs
                          font-medium
                          text-red-500
                        ">
                          {errors.categoryId}
                        </p>
                      ) : (
                        <p className="
                          mt-2
                          text-xs
                          text-slate-400
                        ">
                          Select the category that best
                          matches your product.
                        </p>
                      )}

                    </div>


                    {/* ==================================================
                        SKU
                    =================================================== */}
                    <div>

                      <div className="
                        mb-2.5
                        flex
                        items-center
                        justify-between
                      ">

                        <label
                          htmlFor="sku"
                          className="
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          SKU
                        </label>

                        <span className="
                          rounded-full
                          bg-slate-100
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                        ">
                          Optional
                        </span>

                      </div>


                      <div className="relative">

                        <div className="
                          pointer-events-none
                          absolute
                          inset-y-0
                          left-0
                          flex
                          items-center
                          pl-4
                        ">

                          <span className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            text-slate-600
                          ">

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
                                d="M7 7h.01M7 3h10l4 4-10 10-4-4L17 3M3 17l4 4"
                              />
                            </svg>

                          </span>

                        </div>


                        <input
                          id="sku"
                          type="text"
                          value={formData.sku}
                          onChange={(e) =>
                            updateField(
                              'sku',
                              e.target.value
                            )
                          }
                          placeholder="e.g. PROD-12345"
                          className="
                            h-14
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-4
                            pl-16
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition-all
                            placeholder:font-normal
                            placeholder:text-slate-400
                            hover:border-slate-300
                            hover:bg-white
                            focus:border-violet-500
                            focus:bg-white
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                        />

                      </div>


                      <p className="
                        mt-2
                        text-xs
                        text-slate-400
                      ">
                        A unique code to identify this
                        product in your inventory.
                      </p>

                    </div>

                  </div>

                </section>


                <div className="h-px bg-slate-100" />


                {/* ==================================================
                    PRODUCT IMAGE
                =================================================== */}
                <section>

                  <div className="
                    mb-6
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-pink-50
                      text-pink-600
                    ">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
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

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 15l-5-5L5 21"
                        />
                      </svg>

                    </div>

                    <div>

                      <h3 className="
                        text-base
                        font-bold
                        text-slate-900
                      ">
                        Product Image
                      </h3>

                      <p className="
                        text-xs
                        text-slate-500
                      ">
                        Upload a high-quality main
                        product image.
                      </p>

                    </div>

                  </div>


                  <div className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/60
                    p-5
                    sm:p-6
                  ">

                    <ImageUploadInput
                      label="Main Product Image"
                      value={
                        formData.imageUrl
                      }
                      onChange={(val) =>
                        updateField(
                          'imageUrl',
                          val
                        )
                      }
                      aspectRatio="square"
                      fallbackIcon="📦"
                      placeholder="Paste image URL or upload image file..."
                      helperText="Upload a product image file or provide a direct image URL."
                    />

                  </div>

                </section>

              </form>

            </CardBody>


            {/* ==================================================
                FOOTER
            =================================================== */}
            <CardFooter className="
              flex
              flex-col-reverse
              gap-4
              border-t
              border-slate-100
              bg-slate-50/70
              px-6
              py-6
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-8
              lg:px-10
            ">

              <div className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-500
              ">

                <span className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-50
                  text-emerald-600
                ">

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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                </span>

                <span>
                  Required fields are marked with *
                </span>

              </div>


              <div className="
                flex
                w-full
                flex-col-reverse
                gap-3
                sm:w-auto
                sm:flex-row
              ">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.back()
                  }
                  disabled={isLoading}
                  className="
                    w-full
                    rounded-xl
                    px-7
                    py-2.5
                    font-semibold
                    transition-all
                    hover:bg-white
                    sm:w-auto
                  "
                >
                  Cancel
                </Button>


                <Button
                  type="submit"
                  form="create-product-form"
                  isLoading={isLoading}
                  disabled={isCategoryLoading}
                  className="
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-blue-600
                    px-8
                    py-2.5
                    font-semibold
                    text-white
                    shadow-md
                    shadow-indigo-500/20
                    transition-all
                    hover:-translate-y-0.5
                    hover:shadow-lg
                    hover:shadow-indigo-500/25
                    sm:w-auto
                  "
                >

                  <span className="
                    flex
                    items-center
                    justify-center
                    gap-2
                  ">

                    {!isLoading && (
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

                    {isLoading
                      ? 'Creating Product...'
                      : 'Create Product'}

                  </span>

                </Button>

              </div>

            </CardFooter>

          </Card>

        </div>

      </DashboardLayout>
    </ProtectedRoute>
  );
}
