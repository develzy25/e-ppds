'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools } from '@/components/master';
import { KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PermissionTable } from './PermissionTable';
import { PermissionForm } from './PermissionForm';
import { PermissionEntity } from '../types/permission.type';
import { getPermissions, createPermission, updatePermission, deletePermission } from '../actions/permission.action';
import { useApp } from '@/context/AppContext';

export function PermissionPageClient() {
  const { showToast } = useApp();
  const [permissions, setPermissions] = useState<PermissionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    const res = await getPermissions();
    if (res.success) {
      setPermissions(res.data as PermissionEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
  };

  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedPermission;
    const res = isEdit ? await updatePermission(formData) : await createPermission(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Permission berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchPermissions();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deletePermission(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Permission berhasil dihapus', type: 'success' });
      fetchPermissions();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (permission: PermissionEntity) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedPermission(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Permission"
        description="Manajemen hak akses granular untuk modul dan aksi dalam sistem ERP."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Role & Permission', href: '/master/role' }, { label: 'Permissions' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Permission
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Permission" value={permissions.length} icon={KeyRound} />
        <StatisticsCard title="Permission Ditetapkan" value={permissions.length > 0 ? permissions.length - 1 : 0} icon={ShieldCheck} />
        <StatisticsCard title="Permission Orphan" value={1} icon={ShieldAlert} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <PermissionTable 
            data={permissions} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedPermission ? 'Edit Permission' : 'Tambah Permission'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <PermissionForm initialData={selectedPermission} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Permission?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus permission ini?</p>
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
