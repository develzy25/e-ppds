import { SekolahEntity } from '../../sekolah/types/sekolah.type';

export interface KelasEntity {
  id: string;
  name: string;
  schoolId: string;
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  
  // Relations
  sekolah?: SekolahEntity;
}
