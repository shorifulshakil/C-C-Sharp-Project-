'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Spinner, EmptyState, Card, CardBody, Pagination, ConfirmDialog, LoadingProgress } from '@/components/ui';
import type { Category, PaginatedResponse } from '@/types';

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getCategories({ page: currentPage, pageSize: 10 });
      const data = response.data as PaginatedResponse<Category>;
      setCategories(data.items);
      setTotalPages(Math.ceil(data.total / data.pageSize));
    } catch {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, { name: formData.name, description: formData.description });
      } else {
        await adminApi.createCategory({ name: formData.name, description: formData.description });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch {
      // error handled silently
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteCategory(deleteId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch {
      // error handled silently
    } finally {
      setIsDeleting(false);
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Categories</h2>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
                setIsModalOpen(true);
              }}
            >
              New Category
            </Button>
          </div>
          {categories.length === 0 ? (
            <EmptyState icon="📁" title="No categories" description="Create your first category." />
          ) : (
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{category.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setFormData({ name: category.name, description: category.description || '' });
                              setIsModalOpen(true);
                            }}
                            className="text-primary-600 hover:text-primary-700 mr-3"
                          >
                            Edit
                          </button>
                          <button onClick={() => setDeleteId(category.id)} className="text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-200">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
              <Card className="relative max-w-md w-full">
                <CardBody>
                  <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                      placeholder="Category name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <textarea
                      className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </div>
          )}

          <ConfirmDialog
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            isLoading={isDeleting}
          />
        </div>
      )}
    </>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <DashboardLayout allowedRoles={['Admin']} title="Categories">
        <CategoriesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
