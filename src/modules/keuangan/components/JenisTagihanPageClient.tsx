'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { Receipt, CalendarDays, Wallet } from 'lucide-react';
import { JenisTagihanTable } from './JenisTagihanTable';
import { JenisTagihanForm } from './JenisTagihanForm';
import { JenisTagihanEntity } from '../types/jenis-tagihan.type';
import { getSemuaJenisTagihan, createJenisTagihan, updateJenisTagihan, deleteJenisTagihan } from '../actions/jenis-tagihan.action';
import { useApp } from '@/context/AppContext';

export function JenisTagihanPageClient() {
  const { showToast } = useApp();
  const [data, setData] = useState<JenisTagihanEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<JenisTagihanEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await getSemuaJenisTagihan();
    if (res.success) {
      setData(res.data as JenisTagihanEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedData;
    const res = isEdit ? await updateJenisTagihan(formData) : await createJenisTagihan(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Jenis tagihan berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchData();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteJenisTagihan(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Jenis tagihan berhasil dihapus', type: 'success' });
      fetchData();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (item: JenisTagihanEntity) => {
    setSelectedData(item);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedData(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Jenis Tagihan"
        description="Kelola kategori pembayaran yang diwajibkan kepada santri."
        breadcrumbs={[{ label: 'Keuangan' }, { label: 'Master Data' }, { label: 'Jenis Tagihan' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Tagihan
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Tagihan" value={data.length} icon={Receipt} />
        <StatisticsCard title="Tagihan Bulanan" value={data.filter(d => d.category === 'Bulanan').length} icon={CalendarDays} />
        <StatisticsCard title="Tagihan Tahunan" value={data.filter(d => d.category === 'Tahunan').length} icon={Wallet} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <JenisTagihanTable 
            data={data} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedData ? 'Edit Jenis Tagihan' : 'Tambah Jenis Tagihan'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <JenisTagihanForm initialData={selectedData} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Jenis Tagihan?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus data ini? Pastikan tidak ada master tarif yang bergantung padanya.</p>
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
