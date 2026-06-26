import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FormDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
}

export function FormDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  trigger,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* @ts-expect-error React 19 type mismatch with Radix UI asChild */}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
