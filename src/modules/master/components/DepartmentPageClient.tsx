'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { Building2, Network, UserSquare2 } from 'lucide-react';
import { DepartmentTable } from './DepartmentTable';
import { DepartmentForm } from './DepartmentForm';
import { DepartmentEntity } from '../types/department.type';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../actions/department.action';
import { useApp } from '@/context/AppContext';

export function DepartmentPageClient() {
  const { showToast } = useApp();
  const [departments, setDepartments] = useState<DepartmentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    const res = await getDepartments();
    if (res.success) {
      setDepartments(res.data as DepartmentEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
   
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);



  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedDepartment;
    const res = isEdit ? await updateDepartment(formData) : await createDepartment(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Department berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchDepartments();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteDepartment(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Department berhasil dihapus', type: 'success' });
      fetchDepartments();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (department: DepartmentEntity) => {
    setSelectedDepartment(department);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedDepartment(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Department"
        description="Manajemen divisi dan seksi kepengurusan pondok pesantren."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Struktur Organisasi' }, { label: 'Department' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Department
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Department" value={departments.length} icon={Building2} />
        <StatisticsCard title="Total Divisi" value={departments.filter(d => d.type === 'Divisi').length} icon={Network} />
        <StatisticsCard title="Total Seksi" value={departments.filter(d => d.type === 'Seksi').length} icon={UserSquare2} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <DepartmentTable 
            data={departments} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedDepartment ? 'Edit Department' : 'Tambah Department'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <DepartmentForm initialData={selectedDepartment} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Department?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus department ini?</p>
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
