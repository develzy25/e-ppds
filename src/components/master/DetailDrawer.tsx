import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface DetailDrawerProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
}

export function DetailDrawer({
  title,
  description,
  isOpen,
  onOpenChange,
  trigger,
  children,
}: DetailDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-full sm:w-[400px] md:w-[500px] rounded-none">
        <div className="mx-auto w-full h-full flex flex-col">
          <DrawerHeader className="border-b">
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="p-4 flex-1 overflow-y-auto">
            {children}
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline">Tutup</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
