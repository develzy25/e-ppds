'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { UserCog, Users, UserCheck } from 'lucide-react';
import { PengurusTable } from './PengurusTable';
import { PengurusForm } from './PengurusForm';
import { PengurusEntity } from '../types/pengurus.type';
import { getPenguruss, createPengurus, updatePengurus, deletePengurus } from '../actions/pengurus.action';
import { useApp } from '@/context/AppContext';

export function PengurusPageClient() {
  const { showToast } = useApp();
  const [penguruss, setPenguruss] = useState<PengurusEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPengurus, setSelectedPengurus] = useState<PengurusEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPenguruss = useCallback(async () => {
    setLoading(true);
    const res = await getPenguruss();
    if (res.success) {
      setPenguruss(res.data as PengurusEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
   
  }, []);

  useEffect(() => {
    fetchPenguruss();
  }, [fetchPenguruss]);



  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedPengurus;
    const res = isEdit ? await updatePengurus(formData) : await createPengurus(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Pengurus berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchPenguruss();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deletePengurus(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Pengurus berhasil dihapus', type: 'success' });
      fetchPenguruss();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (pengurus: PengurusEntity) => {
    setSelectedPengurus(pengurus);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedPengurus(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Pengurus"
        description="Manajemen akun pengurus dan ustaz beserta jabatan kepengurusannya."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Kepegawaian' }, { label: 'Pengurus' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Pengurus
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Pengurus" value={penguruss.length} icon={Users} />
        <StatisticsCard title="Pengurus Aktif" value={penguruss.filter(p => p.statusAktif === 'Aktif').length} icon={UserCheck} />
        <StatisticsCard title="Memiliki Jabatan" value={penguruss.filter(p => p.positions && p.positions.length > 0).length} icon={UserCog} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <PengurusTable 
            data={penguruss} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedPengurus ? 'Edit Pengurus' : 'Tambah Pengurus'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <PengurusForm initialData={selectedPengurus} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Pengurus?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus pengurus ini? Akses sistem juga akan terhapus.</p>
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
