'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { Briefcase, Building2, UserCircle } from 'lucide-react';
import { JabatanTable } from './JabatanTable';
import { JabatanForm } from './JabatanForm';
import { JabatanEntity } from '../types/jabatan.type';
import { getJabatans, createJabatan, updateJabatan, deleteJabatan } from '../actions/jabatan.action';
import { useApp } from '@/context/AppContext';

export function JabatanPageClient() {
  const { showToast } = useApp();
  const [jabatans, setJabatans] = useState<JabatanEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState<JabatanEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchJabatans();
  }, []);

  const fetchJabatans = async () => {
    setLoading(true);
    const res = await getJabatans();
    if (res.success) {
      setJabatans(res.data as JabatanEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedJabatan;
    const res = isEdit ? await updateJabatan(formData) : await createJabatan(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Jabatan berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchJabatans();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteJabatan(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Jabatan berhasil dihapus', type: 'success' });
      fetchJabatans();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (jabatan: JabatanEntity) => {
    setSelectedJabatan(jabatan);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedJabatan(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Jabatan"
        description="Manajemen jabatan pengurus di masing-masing department atau seksi."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Struktur Organisasi' }, { label: 'Jabatan' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Jabatan
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Jabatan" value={jabatans.length} icon={Briefcase} />
        <StatisticsCard title="Department Terkait" value={new Set(jabatans.map(j => j.departmentId)).size} icon={Building2} />
        <StatisticsCard title="Jabatan Kosong" value={0} icon={UserCircle} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <JabatanTable 
            data={jabatans} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedJabatan ? 'Edit Jabatan' : 'Tambah Jabatan'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <JabatanForm initialData={selectedJabatan} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Jabatan?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus jabatan ini?</p>
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
