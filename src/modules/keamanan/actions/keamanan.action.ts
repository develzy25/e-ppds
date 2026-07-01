'use strict';
'use server';

import { getCurrentUser } from '@/lib/services/auth';
import { db } from '@/db';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KeamananService } from '../services/keamanan.service';
import { revalidatePath } from 'next/cache';
import { pondoks } from '@/modules/core/schemas/core.schema';
import { eq } from 'drizzle-orm';

export async function getPondokProfileAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const result = await db
    .select()
    .from(pondoks)
    .where(eq(pondoks.id, user.pondokId))
    .limit(1);
    
  return result[0] || null;
}

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
