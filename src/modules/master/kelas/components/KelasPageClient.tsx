'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { Presentation, School, Users2 } from 'lucide-react';
import { KelasTable } from './KelasTable';
import { KelasForm } from './KelasForm';
import { KelasEntity } from '../types/kelas.type';
import { getKelass, createKelas, updateKelas, deleteKelas } from '../actions/kelas.action';
import { useApp } from '@/context/AppContext';

export function KelasPageClient() {
  const { showToast } = useApp();
  const [kelass, setKelass] = useState<KelasEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<KelasEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchKelass();
  }, []);

  const fetchKelass = async () => {
    setLoading(true);
    const res = await getKelass();
    if (res.success) {
      setKelass(res.data as KelasEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedKelas;
    const res = isEdit ? await updateKelas(formData) : await createKelas(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Kelas berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchKelass();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteKelas(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Kelas berhasil dihapus', type: 'success' });
      fetchKelass();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (kelas: KelasEntity) => {
    setSelectedKelas(kelas);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedKelas(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Kelas / Ruang"
        description="Manajemen kelas atau ruangan belajar di sekolah/madrasah."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Akademik' }, { label: 'Kelas' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Kelas
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Kelas" value={kelass.length} icon={Presentation} />
        <StatisticsCard title="Sekolah Terkait" value={new Set(kelass.map(k => k.schoolId)).size} icon={School} />
        {/* Placeholder for future expansion */}
        <StatisticsCard title="Total Kapasitas" value={"N/A"} icon={Users2} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <KelasTable 
            data={kelass} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedKelas ? 'Edit Kelas' : 'Tambah Kelas'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <KelasForm initialData={selectedKelas} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Kelas?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus kelas ini?</p>
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
