export interface PeriodeEntity {
  id: string;
  name: string;
  status: string; // "Aktif" | "Tidak Aktif"
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
