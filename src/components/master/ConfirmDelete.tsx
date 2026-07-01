import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

export function ConfirmDelete({
  title = 'Apakah Anda yakin?',
  description = 'Data yang dihapus (soft-delete) tidak dapat dilihat lagi secara langsung namun masih terekam dalam database.',
  onConfirm,
  children,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      {React.isValidElement(children) ? (
        <AlertDialogTrigger render={children} />
      ) : (
        <AlertDialogTrigger>{children}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Hapus Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
