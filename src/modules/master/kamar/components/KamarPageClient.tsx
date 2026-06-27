'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { BedDouble, Building, Users } from 'lucide-react';
import { KamarTable } from './KamarTable';
import { KamarForm } from './KamarForm';
import { KamarEntity } from '../types/kamar.type';
import { getKamars, createKamar, updateKamar, deleteKamar } from '../actions/kamar.action';
import { useApp } from '@/context/AppContext';

export function KamarPageClient() {
  const { showToast } = useApp();
  const [kamars, setKamars] = useState<KamarEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedKamar, setSelectedKamar] = useState<KamarEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchKamars = useCallback(async () => {
    setLoading(true);
    const res = await getKamars();
    if (res.success) {
      setKamars(res.data as KamarEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
   
  }, []);

  useEffect(() => {
    fetchKamars();
  }, [fetchKamars]);



  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedKamar;
    const res = isEdit ? await updateKamar(formData) : await createKamar(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Kamar berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchKamars();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteKamar(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Kamar berhasil dihapus', type: 'success' });
      fetchKamars();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (kamar: KamarEntity) => {
    setSelectedKamar(kamar);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedKamar(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Kamar"
        description="Manajemen kamar atau ruang tidur asrama santri."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Asrama' }, { label: 'Kamar' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Kamar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Kamar" value={kamars.length} icon={BedDouble} />
        <StatisticsCard title="Total Kapasitas" value={kamars.reduce((acc, curr) => acc + curr.capacity, 0)} icon={Users} />
        <StatisticsCard title="Blok Terkait" value={new Set(kamars.map(k => k.blockId)).size} icon={Building} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <KamarTable 
            data={kamars} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedKamar ? 'Edit Kamar' : 'Tambah Kamar'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <KamarForm initialData={selectedKamar} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Kamar?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus kamar ini?</p>
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
