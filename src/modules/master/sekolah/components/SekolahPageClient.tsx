'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { GraduationCap, Library, BookText } from 'lucide-react';
import { SekolahTable } from './SekolahTable';
import { SekolahForm } from './SekolahForm';
import { SekolahEntity } from '../types/sekolah.type';
import { getSekolahs, createSekolah, updateSekolah, deleteSekolah } from '../actions/sekolah.action';
import { useApp } from '@/context/AppContext';

export function SekolahPageClient() {
  const { showToast } = useApp();
  const [sekolahs, setSekolahs] = useState<SekolahEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSekolah, setSelectedSekolah] = useState<SekolahEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSekolahs();
  }, []);

  const fetchSekolahs = async () => {
    setLoading(true);
    const res = await getSekolahs();
    if (res.success) {
      setSekolahs(res.data as SekolahEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedSekolah;
    const res = isEdit ? await updateSekolah(formData) : await createSekolah(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Sekolah berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchSekolahs();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteSekolah(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Sekolah berhasil dihapus', type: 'success' });
      fetchSekolahs();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (sekolah: SekolahEntity) => {
    setSelectedSekolah(sekolah);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedSekolah(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Sekolah / Madrasah"
        description="Manajemen institusi pendidikan formal maupun diniyah yang ada di dalam pondok."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Akademik' }, { label: 'Sekolah' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Sekolah
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Institusi" value={sekolahs.length} icon={Library} />
        <StatisticsCard title="Pendidikan Formal" value={sekolahs.filter(p => p.type === 'Formal').length} icon={GraduationCap} />
        <StatisticsCard title="Madrasah Diniyah" value={sekolahs.filter(p => p.type === 'Diniyah').length} icon={BookText} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <SekolahTable 
            data={sekolahs} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedSekolah ? 'Edit Sekolah' : 'Tambah Sekolah'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <SekolahForm initialData={selectedSekolah} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Sekolah?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus sekolah ini?</p>
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
