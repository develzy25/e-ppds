'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { User, Users, GraduationCap } from 'lucide-react';
import { SantriTable } from './SantriTable';
import { SantriForm } from './SantriForm';
import { SantriEntity } from '../types/santri.type';
import { getSantris, createSantri, updateSantri, deleteSantri } from '../actions/santri.action';
import { useApp } from '@/context/AppContext';

export function SantriPageClient() {
  const { showToast } = useApp();
  const [santris, setSantris] = useState<SantriEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<SantriEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSantris();
  }, []);

  async function fetchSantris() {
    setLoading(true);
    const res = await getSantris();
    if (res.success) {
      setSantris(res.data as SantriEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  }

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedSantri;
    
    // Intercept null values
    const dataStr = formData.get('data') as string;
    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      if (parsed.roomId === 'null' || parsed.roomId === '') parsed.roomId = null;
      if (parsed.classFormalId === 'null' || parsed.classFormalId === '') parsed.classFormalId = null;
      if (parsed.classDiniyahId === 'null' || parsed.classDiniyahId === '') parsed.classDiniyahId = null;
      formData.set('data', JSON.stringify(parsed));
    }
    
    const res = isEdit ? await updateSantri(formData) : await createSantri(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Santri berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchSantris();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteSantri(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Santri berhasil dihapus', type: 'success' });
      fetchSantris();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (santri: SantriEntity) => {
    setSelectedSantri(santri);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedSantri(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Santri"
        description="Manajemen data induk santri, penempatan kamar, dan kelas."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Pesantren' }, { label: 'Santri' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Santri
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Santri (Aktif)" value={santris.filter(s => s.statusAktif === 'Aktif').length} icon={Users} />
        <StatisticsCard title="Santri Putra (L)" value={santris.filter(s => s.gender === 'L' && s.statusAktif === 'Aktif').length} icon={User} />
        <StatisticsCard title="Santri Putri (P)" value={santris.filter(s => s.gender === 'P' && s.statusAktif === 'Aktif').length} icon={User} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <SantriTable 
            data={santris} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedSantri ? 'Edit Santri' : 'Tambah Santri'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <SantriForm initialData={selectedSantri} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Santri?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus santri ini?</p>
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
