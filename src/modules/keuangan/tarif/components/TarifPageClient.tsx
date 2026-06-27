'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { FileText, CalendarDays, Wallet } from 'lucide-react';
import { TarifTable } from './TarifTable';
import { TarifForm } from './TarifForm';
import { TarifWithRelationsEntity, AcademicYearEntity } from '../types/tarif.type';
import { JenisTagihanEntity } from '../../jenis-tagihan/types/jenis-tagihan.type';
import { getSemuaTarif, createTarif, updateTarif, deleteTarif } from '../actions/tarif.action';
import { getSemuaJenisTagihan } from '../../jenis-tagihan/actions/jenis-tagihan.action';
import { getTahunAjarans } from '@/modules/master/tahun-ajaran/actions/tahun-ajaran.action';
import { useApp } from '@/context/AppContext';

export function TarifPageClient() {
  const { showToast } = useApp();
  const [data, setData] = useState<TarifWithRelationsEntity[]>([]);
  const [jenisTagihans, setJenisTagihans] = useState<JenisTagihanEntity[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<TarifWithRelationsEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDependencies = async () => {
    const resJenis = await getSemuaJenisTagihan();
    if (resJenis.success) {
      setJenisTagihans(resJenis.data as JenisTagihanEntity[]);
    }
    const resTahun = await getTahunAjarans();
    if (resTahun.success) {
      setAcademicYears(resTahun.data as AcademicYearEntity[]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const res = await getSemuaTarif();
    if (res.success) {
      setData(res.data as TarifWithRelationsEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDependencies();
    fetchData();
  }, []);

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedData;
    const res = isEdit ? await updateTarif(formData) : await createTarif(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Tarif berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchData();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteTarif(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Tarif berhasil dihapus', type: 'success' });
      fetchData();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (item: TarifWithRelationsEntity) => {
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
        title="Master Tarif"
        description="Kelola nominal pembayaran berdasarkan jenis tagihan dan tahun ajaran."
        breadcrumbs={[{ label: 'Keuangan' }, { label: 'Master Data' }, { label: 'Tarif' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Tarif
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Tarif" value={data.length} icon={Wallet} />
        <StatisticsCard title="Tahun Ajaran Aktif" value={academicYears.filter(a => (a as any).status === 'Aktif').length} icon={CalendarDays} />
        <StatisticsCard title="Jenis Tagihan" value={jenisTagihans.length} icon={FileText} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <TarifTable 
            data={data} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedData ? 'Edit Tarif' : 'Tambah Tarif'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <TarifForm 
          initialData={selectedData} 
          jenisTagihans={jenisTagihans} 
          academicYears={academicYears} 
          onSubmit={handleFormSubmit} 
        />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Tarif?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus data tarif ini? Operasi akan dibatalkan jika tarif sudah digunakan pada tagihan aktif.</p>
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
