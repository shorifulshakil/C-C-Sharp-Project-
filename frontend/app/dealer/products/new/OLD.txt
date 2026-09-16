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
  Select,
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
    const fetchCategories = async () => {
      try {
        const response = await publicApi.getCategories();
        setCategories(response.data);
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = 'Price must be greater than 0';
    if (!formData.stockQuantity || Number(formData.stockQuantity) < 0)
      newErrors.stockQuantity = 'Stock must be 0 or greater';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await dealerApi.createProduct({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.categoryId,
        sku: formData.sku.trim() || undefined,
        images: formData.imageUrl.trim()
          ? [{ imageUrl: formData.imageUrl.trim(), displayOrder: 0 }]
          : undefined,
      });

      toast.success('Product created successfully!');
      router.push('/dealer/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Dealer']}>
      <DashboardLayout allowedRoles={['Dealer']} title="New Product">
        <div className="mx-auto w-full max-w-5xl">
          {/* Header */}
          <div className="mb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Product Management
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Add New Product
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Fill in the details and add product images to list your item in the store.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
            <div className="border-b border-slate-100 bg-gradient-to-r from-neutral-50 via-white to-indigo-50/40 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Product Details
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Provide accurate name, price, stock, category, and product images.
                  </p>
                </div>
              </div>
            </div>

            <CardBody className="p-6 sm:p-8">
              <form id="create-product-form" onSubmit={handleSubmit} className="space-y-7">
                {/* Product Name */}
                <Input
                  label="Product Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  error={errors.name}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  required
                />

                {/* Price + Stock */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Price ($) *"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    error={errors.price}
                    placeholder="0.00"
                    required
                  />

                  <Input
                    label="Stock Quantity *"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockQuantity: e.target.value,
                      }))
                    }
                    error={errors.stockQuantity}
                    placeholder="e.g. 50"
                    required
                  />
                </div>

                {/* Category + SKU */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Select
                    label="Category *"
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
                  />

                  <Input
                    label="SKU (optional)"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    placeholder="e.g. PROD-12345"
                  />
                </div>

                {/* Product Image Section */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter detailed description, key features, and specifications..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </form>
            </CardBody>

            <CardFooter className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full rounded-xl px-7 py-2.5 font-semibold transition-all hover:bg-white sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-product-form"
                isLoading={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 py-2.5 font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 sm:w-auto"
              >
                Create Product
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
