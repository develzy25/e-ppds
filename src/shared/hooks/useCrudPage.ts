'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

interface CrudPageOptions<T> {
  entityName: string;
  fetchData: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  createAction: (data: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  updateAction: (data: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function useCrudPage<T>({
  entityName,
  fetchData,
  createAction,
  updateAction,
  deleteAction
}: CrudPageOptions<T>) {
  const { showToast } = useApp();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<T | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchData();
    if (res.success && res.data) {
      setData(res.data as T[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  }, [fetchData, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedEntity;
    const res = isEdit ? await updateAction(formData) : await createAction(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `${entityName} berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      loadData();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteAction(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: `${entityName} berhasil dihapus`, type: 'success' });
      loadData();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (entity: T) => {
    setSelectedEntity(entity);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedEntity(undefined);
    setIsFormOpen(true);
  };

  return {
    data,
    loading,
    isFormOpen,
    setIsFormOpen,
    selectedEntity,
    deleteId,
    setDeleteId,
    handleFormSubmit,
    handleDelete,
    openEdit,
    openCreate,
    loadData, // in case manual reload is needed
  };
}
