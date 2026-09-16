'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { dealerApi, publicApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Button,
  Input,
  Select,
  Card,
  CardBody,
  CardFooter,
  ImageUploadInput,
} from '@/components/ui';
import type { Category } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          dealerApi.getProduct(params.id as string),
          publicApi.getCategories(),
        ]);

        const product = productRes.data;

        if (product) {
          const primaryImg =
            product.images && product.images.length > 0
              ? product.images[0].imageUrl
              : '';
          setFormData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            stockQuantity: String(product.stockQuantity),
            categoryId: product.categoryId,
            sku: product.sku || '',
            imageUrl: primaryImg,
          });
        }

        setCategories(categoriesRes.data);
      } catch {
        toast.error('Failed to load product');
      }
    };

    fetchData();
  }, [params.id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (
      !formData.stockQuantity ||
      Number(formData.stockQuantity) < 0
    ) {
      newErrors.stockQuantity =
        'Stock must be 0 or greater';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await dealerApi.updateProduct(params.id as string, {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.categoryId,
        sku: formData.sku || undefined,
        images: formData.imageUrl.trim()
          ? [{ imageUrl: formData.imageUrl.trim(), displayOrder: 0 }]
          : [],
      });

      toast.success('Product updated successfully!');
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
          'Failed to update product'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout
        allowedRoles={['Dealer']}
        title="Edit Product"
      >
        <div className="mx-auto w-full max-w-5xl">

          {/* ================================================= */}
          {/* PAGE HEADER */}
          {/* ================================================= */}

          <div className="mb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />

                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Product Management
                  </span>
                </div>

                {/* <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Edit Product
                </h1> */}

                <p className="mt-1.5 text-sm text-slate-500">
                  Update your product information and inventory.
                </p>
              </div>

              <div
                className="
                  flex w-fit items-center gap-2
                  rounded-full
                  border border-indigo-100
                  bg-indigo-50
                  px-4 py-2
                "
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>

                <span className="text-xs font-semibold text-indigo-600">
                  Editing Product
                </span>
              </div>

            </div>
          </div>

          {/* ================================================= */}
          {/* CARD */}
          {/* ================================================= */}

          <Card
            className="
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-xl
              shadow-slate-200/40
            "
          >

            {/* ================================================= */}
            {/* CARD HEADER */}
            {/* ================================================= */}

            <div
              className="
                border-b border-slate-100
                bg-gradient-to-r
                from-neutral-50
                via-white
                to-indigo-50/40
                px-6 py-5
                sm:px-8
              "
            >
              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-11 w-11
                    shrink-0
                    items-center justify-center
                    rounded-2xl
                    bg-indigo-600
                    shadow-lg
                    shadow-indigo-500/20
                  "
                >
                  <svg
                    className="h-5.5 w-5.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Product Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Update the information below.
                  </p>
                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <CardBody className="p-6 sm:p-8">

              <form
                id="edit-product-form"
                onSubmit={handleSubmit}
                className="space-y-7"
              >

                {/* ============================================= */}
                {/* PRODUCT NAME */}
                {/* ============================================= */}

                <div>
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    error={errors.name}
                    placeholder="Enter product name"
                    required
                    className="
                      !rounded-2xl
                      !border-slate-200
                      !bg-slate-50/70
                      !px-4
                      !py-3.5
                      text-[15px]
                    "
                  />
                </div>

                {/* ============================================= */}
                {/* PRICE + STOCK */}
                {/* ============================================= */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    error={errors.price}
                    placeholder="Enter product price"
                    required
                    className="
                      !rounded-2xl
                      !border-slate-200
                      !bg-slate-50/70
                      !px-4
                      !py-3.5
                      text-[15px]
                    "
                  />

                  <Input
                    label="Stock Quantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockQuantity: e.target.value,
                      }))
                    }
                    error={errors.stockQuantity}
                    placeholder="Enter stock quantity"
                    required
                    className="
                      !rounded-2xl
                      !border-slate-200
                      !bg-slate-50/70
                      !px-4
                      !py-3.5
                      text-[15px]
                    "
                  />

                </div>

                {/* ============================================= */}
                {/* CATEGORY + SKU */}
                {/* ============================================= */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  <Select
                    label="Category"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    error={errors.categoryId}
                    required
                    className="
                      !rounded-2xl
                      !border-slate-200
                      !bg-slate-50/70
                      !px-4
                      !py-3.5
                    "
                  />

                  <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sku: e.target.value,
                      }))
                    }
                    placeholder="Enter product SKU"
                    className="
                      !rounded-2xl
                      !border-slate-200
                      !bg-slate-50/70
                      !px-4
                      !py-3.5
                      text-[15px]
                    "
                  />

                </div>

                {/* ============================================= */}
                {/* PRODUCT IMAGE */}
                {/* ============================================= */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span>📷</span> Product Image Upload / URL
                  </h3>
                  <ImageUploadInput
                    label="Main Product Image"
                    value={formData.imageUrl}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, imageUrl: val }))
                    }
                    aspectRatio="square"
                    fallbackIcon="📦"
                    placeholder="Paste image URL or upload image file..."
                    helperText="Upload a product image file or provide a direct image URL link."
                  />
                </div>

              </form>

            </CardBody>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <CardFooter
              className="
                flex flex-col-reverse
                gap-3
                border-t border-slate-100
                bg-slate-50/60
                px-6 py-5
                sm:flex-row
                sm:items-center
                sm:justify-end
                sm:px-8
              "
            >

              {/* CANCEL */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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

              {/* UPDATE */}
              <Button
                type="submit"
                form="edit-product-form"
                isLoading={isLoading}
                className="
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-blue-600
                  px-7
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
                <span className="flex items-center justify-center gap-2">

                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  Update Product

                </span>
              </Button>

            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}