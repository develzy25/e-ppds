import { db } from '@/db';
import { serviceCatalogs, servicePrices } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function createCatalogItem(
  id: string,
  name: string,
  module: string,
  description: string | null,
  pondokId: string
) {
  await db.insert(serviceCatalogs).values({
    id,
    name,
    module,
    description,
    pondokId,
  });
  return id;
}

export async function getCatalogItems(pondokId: string, module?: string) {
  if (module) {
    return db
      .select()
      .from(serviceCatalogs)
      .where(
        and(
          eq(serviceCatalogs.pondokId, pondokId),
          eq(serviceCatalogs.module, module)
        )
      );
  }
  return db
    .select()
    .from(serviceCatalogs)
    .where(eq(serviceCatalogs.pondokId, pondokId));
}

export async function getCatalogItemById(id: string, pondokId: string) {
  const result = await db
    .select()
    .from(serviceCatalogs)
    .where(and(eq(serviceCatalogs.id, id), eq(serviceCatalogs.pondokId, pondokId)))
    .limit(1);
  return result[0] || null;
}

export async function addServicePrice(
  catalogId: string,
  priceName: string,
  price: number,
  unit: string,
  periodId: string,
  pondokId: string
) {
  const id = `price-${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();
  await db.insert(servicePrices).values({
    id,
    catalogId,
    priceName,
    price,
    unit,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
    periodId,
    pondokId,
  });
  return id;
}

export async function getPricesForCatalog(
  catalogId: string,
  pondokId: string,
  periodId: string,
  onlyActive = true
) {
  const conditions = [
    eq(servicePrices.catalogId, catalogId),
    eq(servicePrices.pondokId, pondokId),
    eq(servicePrices.periodId, periodId),
  ];
  if (onlyActive) {
    conditions.push(eq(servicePrices.isActive, 1));
  }
  return db
    .select()
    .from(servicePrices)
    .where(and(...conditions))
    .orderBy(desc(servicePrices.createdAt));
}

export async function updateServicePrice(
  priceId: string,
  price: number,
  isActive: number,
  pondokId: string
) {
  const now = new Date().toISOString();
  await db
    .update(servicePrices)
    .set({
      price,
      isActive,
      updatedAt: now,
    })
    .where(and(eq(servicePrices.id, priceId), eq(servicePrices.pondokId, pondokId)));
}
