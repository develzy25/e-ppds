export interface SekolahEntity {
  id: string;
  name: string;
  type: string; // "Formal" | "Diniyah"
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
}
