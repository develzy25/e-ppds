'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { CalendarRange, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PeriodeTable } from './PeriodeTable';
import { PeriodeForm } from './PeriodeForm';
import { PeriodeEntity } from '../types/periode.type';
import { getPeriodes, createPeriode, updatePeriode, deletePeriode } from '../actions/periode.action';
import { useApp } from '@/context/AppContext';

export function PeriodePageClient() {
  const { showToast } = useApp();
  const [periodes, setPeriodes] = useState<PeriodeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPeriodes = useCallback(async () => {
    setLoading(true);
    const res = await getPeriodes();
    if (res.success) {
      setPeriodes(res.data as PeriodeEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
   
  }, []);

  useEffect(() => {
    fetchPeriodes();
  }, [fetchPeriodes]);



  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedPeriode;
    const res = isEdit ? await updatePeriode(formData) : await createPeriode(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Periode berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchPeriodes();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deletePeriode(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Periode berhasil dihapus', type: 'success' });
      fetchPeriodes();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (periode: PeriodeEntity) => {
    setSelectedPeriode(periode);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedPeriode(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Periode"
        description="Manajemen periode masa bakti kepengurusan."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Periode Kepengurusan' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Periode
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Periode" value={periodes.length} icon={CalendarRange} />
        <StatisticsCard title="Periode Aktif" value={periodes.filter(p => p.status === 'Aktif').length} icon={CheckCircle2} />
        <StatisticsCard title="Periode Tidak Aktif" value={periodes.filter(p => p.status === 'Tidak Aktif').length} icon={ShieldAlert} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <PeriodeTable 
            data={periodes} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedPeriode ? 'Edit Periode' : 'Tambah Periode'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <PeriodeForm initialData={selectedPeriode} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Periode?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus periode ini?</p>
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
