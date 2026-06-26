import { db } from '@/db';
import { servicePrices, serviceCatalogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface CalculatePriceInput {
  catalogId: string;
  priceName?: string; // e.g. "Reguler", "Kilat", etc.
  quantity: number;
  pondokId: string;
  periodId: string;
}

export interface PriceResult {
  priceId: string;
  catalogId: string;
  catalogName: string;
  priceName: string;
  unitPrice: number;
  unit: string;
  totalPrice: number;
}

/**
 * Pricing Engine Terpusat untuk menghitung tarif secara dinamis berdasarkan catalogId & priceName
 */
export async function calculatePrice({
  catalogId,
  priceName = 'Reguler',
  quantity,
  pondokId,
  periodId,
}: CalculatePriceInput): Promise<PriceResult> {
  // 1. Get the catalog item info
  const catalogResult = await db
    .select()
    .from(serviceCatalogs)
    .where(and(eq(serviceCatalogs.id, catalogId), eq(serviceCatalogs.pondokId, pondokId)))
    .limit(1);

  if (catalogResult.length === 0) {
    throw new Error(`Catalog item with ID "${catalogId}" not found for this pondok.`);
  }

  const catalog = catalogResult[0];

  // 2. Find the active price matching catalogId, periodId, and priceName
  const priceResult = await db
    .select()
    .from(servicePrices)
    .where(
      and(
        eq(servicePrices.catalogId, catalogId),
        eq(servicePrices.priceName, priceName),
        eq(servicePrices.isActive, 1),
        eq(servicePrices.periodId, periodId),
        eq(servicePrices.pondokId, pondokId)
      )
    )
    .limit(1);

  if (priceResult.length === 0) {
    // Fallback: search for any active price for this catalog
    const fallbackPriceResult = await db
      .select()
      .from(servicePrices)
      .where(
        and(
          eq(servicePrices.catalogId, catalogId),
          eq(servicePrices.isActive, 1),
          eq(servicePrices.periodId, periodId),
          eq(servicePrices.pondokId, pondokId)
        )
      )
      .limit(1);

    if (fallbackPriceResult.length === 0) {
      throw new Error(`No active price configuration found for catalog item "${catalogId}".`);
    }

    const priceConfig = fallbackPriceResult[0];
    return {
      priceId: priceConfig.id,
      catalogId: catalog.id,
      catalogName: catalog.name,
      priceName: priceConfig.priceName,
      unitPrice: priceConfig.price,
      unit: priceConfig.unit,
      totalPrice: priceConfig.price * quantity,
    };
  }

  const priceConfig = priceResult[0];
  return {
    priceId: priceConfig.id,
    catalogId: catalog.id,
    catalogName: catalog.name,
    priceName: priceConfig.priceName,
    unitPrice: priceConfig.price,
    unit: priceConfig.unit,
    totalPrice: priceConfig.price * quantity,
  };
}
