import { JenisTagihanEntity } from './jenis-tagihan.type';

// Note: masterAcademicYear type should ideally come from master module
export interface AcademicYearEntity {
  id: string;
  name: string; // e.g. "2026-2027"
}

export interface TarifEntity {
  id: string;
  jenisTagihanId: string;
  academicYearId: string;
  amount: number;
  description: string | null;
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}

export interface TarifWithRelationsEntity extends TarifEntity {
  jenisTagihan?: JenisTagihanEntity;
  academicYear?: AcademicYearEntity;
}
