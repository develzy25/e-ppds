import { DepartmentEntity } from '../../department/types/department.type';

export interface JabatanEntity {
  id: string;
  name: string;
  departmentId: string;
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  
  // Relations
  department?: DepartmentEntity;
}
