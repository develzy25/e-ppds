'use strict';
'use server';

import { getCurrentUser } from '@/lib/services/auth';
import { db } from '@/db';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KeamananService } from '../services/keamanan.service';
import { revalidatePath } from 'next/cache';

export async function getPermitsAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const uow = new UnitOfWork(db);
  const service = new KeamananService(uow);
  return service.getPermits(user.pondokId, user.permissions);
}

export async function getOffensesAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const uow = new UnitOfWork(db);
  const service = new KeamananService(uow);
  return service.getOffenses(user.pondokId, user.permissions);
}

export async function approvePermitAction(permitId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const uow = new UnitOfWork(db);
  const service = new KeamananService(uow);
  const result = await service.approvePermit(permitId, user.pondokId, user.permissions, user.userId);
  revalidatePath('/keamanan');
  return result;
}

export async function createPermitAction(input: {
  santriId: string;
  type: string;
  startDate: string;
  endDate: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const uow = new UnitOfWork(db);
  const service = new KeamananService(uow);
  const result = await service.createPermit(input, user.pondokId, user.permissions, user.userId);
  revalidatePath('/keamanan');
  return result;
}

export async function addOffenseAction(input: {
  santriId: string;
  category: string;
  description: string;
  points: number;
  handlerName: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const uow = new UnitOfWork(db);
  const service = new KeamananService(uow);
  const result = await service.addOffense(input, user.pondokId, user.permissions, user.userId);
  revalidatePath('/keamanan');
  return result;
}
