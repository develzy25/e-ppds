import { RoleEntity } from './role.type';
import { JabatanEntity } from './jabatan.type';
import { PeriodeEntity } from './periode.type';

export interface PengurusPosition {
  id: string;
  positionId: string;
  periodId: string;
  status: string;
  jabatan?: JabatanEntity;
  periode?: PeriodeEntity;
}

export interface PengurusEntity {
  id: string;
  santriId: string | null;
  name: string;
  email: string;
  statusAktif: string; // "Aktif" | "Nonaktif"
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  
  // Relations
  roles?: RoleEntity[];
  positions?: PengurusPosition[];
}
