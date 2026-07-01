'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { Map, MapPin, Building2 } from 'lucide-react';
import { BlokTable } from './BlokTable';
import { BlokForm } from './BlokForm';
import { BlokEntity } from '../types/blok.type';
import { getBloks, createBlok, updateBlok, deleteBlok } from '../actions/blok.action';
import { useApp } from '@/context/AppContext';

export function BlokPageClient() {
  const { showToast } = useApp();
  const [bloks, setBloks] = useState<BlokEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBlok, setSelectedBlok] = useState<BlokEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBloks = useCallback(async () => {
    setLoading(true);
    const res = await getBloks();
    if (res.success) {
      setBloks(res.data as BlokEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
   
  }, []);

  useEffect(() => {
    fetchBloks();
  }, [fetchBloks]);



  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedBlok;
    const res = isEdit ? await updateBlok(formData) : await createBlok(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Blok berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchBloks();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteBlok(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Blok berhasil dihapus', type: 'success' });
      fetchBloks();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (blok: BlokEntity) => {
    setSelectedBlok(blok);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedBlok(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Blok"
        description="Manajemen blok, gedung, atau area wilayah tempat tinggal santri."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Asrama' }, { label: 'Blok' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Blok
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        <StatisticsCard title="Total Blok" value={bloks.length} icon={Map} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <BlokTable 
            data={bloks} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedBlok ? 'Edit Blok' : 'Tambah Blok'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <BlokForm initialData={selectedBlok} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Blok?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus blok ini?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-md text-sm">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-500 text-white rounded-md text-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
