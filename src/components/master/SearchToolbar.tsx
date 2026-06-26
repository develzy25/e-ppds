import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchToolbarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchToolbar({ placeholder = 'Cari...', value, onChange }: SearchToolbarProps) {
  return (
    <div className="relative max-w-sm w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        className="pl-9 bg-background/50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
