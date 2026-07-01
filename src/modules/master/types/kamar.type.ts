import { BlokEntity } from './blok.type';

export interface KamarEntity {
  id: string;
  name: string;
  capacity: number;
  blockId: string;
  pondokId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  
  // Relations
  blok?: BlokEntity;
}
