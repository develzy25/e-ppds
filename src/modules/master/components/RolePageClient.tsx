'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatisticsCard, FormDialog, ConfirmDelete, ImportExportTools, StatusBadge } from '@/components/master';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { RoleTable } from './RoleTable';
import { RoleForm } from './RoleForm';
import { RoleEntity } from '../types/role.type';
import { getRoles, createRole, updateRole, deleteRole } from '../actions/role.action';
import { useApp } from '@/context/AppContext';

export function RolePageClient() {
  const { showToast } = useApp();
  const [roles, setRoles] = useState<RoleEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleEntity | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    const res = await getRoles();
    if (res.success) {
      setRoles(res.data as RoleEntity[]);
    } else {
      showToast({ title: 'Gagal memuat data', message: res.error as string, type: 'error' });
    }
    setLoading(false);
   
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);



  const handleFormSubmit = async (formData: FormData) => {
    const isEdit = !!selectedRole;
    const res = isEdit ? await updateRole(formData) : await createRole(formData);
    
    if (res.success) {
      showToast({ title: 'Berhasil', message: `Role berhasil di${isEdit ? 'perbarui' : 'tambahkan'}`, type: 'success' });
      setIsFormOpen(false);
      fetchRoles();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteRole(deleteId);
    if (res.success) {
      showToast({ title: 'Berhasil', message: 'Role berhasil dihapus', type: 'success' });
      fetchRoles();
    } else {
      showToast({ title: 'Gagal', message: res.error as string, type: 'error' });
    }
    setDeleteId(null);
  };

  const openEdit = (role: RoleEntity) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedRole(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Role"
        description="Manajemen role dan hak akses (RBAC) pengguna ERP."
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Role & Permission' }]}
        action={
          <div className="flex items-center gap-2">
            <ImportExportTools />
            <button 
              onClick={openCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
            >
              + Tambah Role
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticsCard title="Total Role" value={roles.length} icon={Shield} />
        <StatisticsCard title="Role Aktif Terpakai" value={roles.length > 0 ? roles.length - 1 : 0} icon={ShieldCheck} />
        <StatisticsCard title="Role Kosong" value={1} icon={ShieldAlert} />
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <RoleTable 
            data={roles} 
            onEdit={openEdit} 
            onDelete={(id) => setDeleteId(id)} 
          />
        )}
      </div>

      <FormDialog 
        title={selectedRole ? 'Edit Role' : 'Tambah Role'} 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
      >
        <RoleForm initialData={selectedRole} onSubmit={handleFormSubmit} />
      </FormDialog>

      <ConfirmDelete 
        onConfirm={handleDelete}
      >
        <button id="delete-trigger" className="hidden" onClick={() => {}}></button>
      </ConfirmDelete>
      {/* We need a controlled dialog for delete since ConfirmDelete uses AlertDialogTrigger. 
          Will trigger it manually via state or refactor ConfirmDelete. */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Hapus Role?</h3>
            <p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus role ini?</p>
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
