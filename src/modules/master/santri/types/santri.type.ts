import { KamarEntity } from '../../kamar/types/kamar.type';
import { KelasEntity } from '../../kelas/types/kelas.type';
import { TahunAjaranEntity } from '../../tahun-ajaran/types/tahun-ajaran.type';

export interface SantriEntity {
  id: string;
  nis: string;
  name: string;
  gender: string; // "L" | "P"
  statusAktif: string; // "Aktif" | "Alumni"
  roomId: string | null;
  classFormalId: string | null;
  classDiniyahId: string | null;
  academicYearId: string;
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  
  // Relations
  kamar?: KamarEntity;
  classFormal?: KelasEntity;
  classDiniyah?: KelasEntity;
  academicYear?: TahunAjaranEntity;
}
