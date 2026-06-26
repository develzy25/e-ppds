import { SQL, and, eq, isNull, Column } from 'drizzle-orm';

export interface TenantContext {
  pondokId: string;
  periodId?: string;
}

/**
 * Tenant Isolation & Data Leak Guard.
 * Helper utility to build query filters automatically enforcing multi-tenant isolation, period scope, and soft-delete exclusions.
 */
export function enforceTenantIsolation(
  table: Record<string, unknown>,
  context: TenantContext,
  additionalConditions: (SQL | undefined)[] = []
): SQL {
  const conditions: SQL[] = [];

  // Enforce pondok_id isolation
  if ('pondokId' in table) {
    conditions.push(eq(table.pondokId as Column, context.pondokId));
  }

  // Enforce period_id isolation if context provides it and table supports it
  if (context.periodId && 'periodId' in table) {
    conditions.push(eq(table.periodId as Column, context.periodId));
  }

  // Enforce soft-delete check if table supports deletedAt
  if ('deletedAt' in table) {
    conditions.push(isNull(table.deletedAt as Column));
  }

  // Append any extra caller-defined conditions
  for (const cond of additionalConditions) {
    if (cond) {
      conditions.push(cond);
    }
  }

  return and(...conditions) as SQL;
}
