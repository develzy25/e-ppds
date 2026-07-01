export interface DepartmentEntity {
  id: string;
  name: string;
  type: string; // "Divisi" | "Seksi"
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
