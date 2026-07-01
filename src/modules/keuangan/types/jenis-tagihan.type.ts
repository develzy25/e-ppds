export interface JenisTagihanEntity {
  id: string;
  name: string;
  category: string; // "Bulanan" | "Tahunan" | "Insidental"
  description: string | null;
  isActive: boolean;
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
