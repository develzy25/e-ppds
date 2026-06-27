'use client';

import React from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { Calendar, CalendarCheck, CalendarDays } from 'lucide-react';
import { TahunAjaranTable } from './TahunAjaranTable';
import { TahunAjaranForm } from './TahunAjaranForm';
import { TahunAjaranEntity } from '../types/tahun-ajaran.type';
import { getTahunAjarans, createTahunAjaran, updateTahunAjaran, deleteTahunAjaran } from '../actions/tahun-ajaran.action';
import { useCrudPage } from '@/shared/hooks/useCrudPage';

export function TahunAjaranPageClient() {
  const {
    data: tahunAjarans,
    loading,
    isFormOpen,
    setIsFormOpen,
    selectedEntity: selectedTahunAjaran,
    deleteId,
    setDeleteId,
    handleFormSubmit,
    handleDelete,
    openEdit,
    openCreate,
  } = useCrudPage<TahunAjaranEntity>({
    entityName: 'Tahun Ajaran',
    fetchData: getTahunAjarans,
    createAction: createTahunAjaran,
    updateAction: updateTahunAjaran,
    deleteAction: deleteTahunAjaran,
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Tahun Ajaran"
        description="Manajemen periode waktu pendidikan aktif (contoh: 2024/2025 Ganjil)."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Akademik' }, { label: 'Tahun Ajaran' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Tahun Ajaran
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Tahun Ajaran" value={tahunAjarans.length} icon={CalendarDays} />
        <StatisticsCard title="Tahun Ajaran Aktif" value={tahunAjarans.filter(p => p.status === 'Aktif').length} icon={CalendarCheck} />
        <StatisticsCard title="Tahun Ajaran Mendatang" value={tahunAjarans.filter(p => p.status === 'Mendatang').length} icon={Calendar} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <TahunAjaranTable 
            data={tahunAjarans} 
            onEdit={openEdit} 
            onDelete={setDeleteId} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <TahunAjaranForm initialData={selectedTahunAjaran} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Tahun Ajaran?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus tahun ajaran ini?</p>
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
