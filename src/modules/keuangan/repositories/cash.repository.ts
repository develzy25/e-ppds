import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { cashBooks } from '@/modules/laboratorium/schemas/lab.schema';
import { eq, and } from 'drizzle-orm';

export class CashRepository extends BaseRepository<typeof cashBooks> {
  constructor(dbClient?: DbClient) {
    super(cashBooks, dbClient);
  }

  async getCashBookByDate(date: string, pondokId: string, periodId: string) {
    const conditions = this.buildBaseConditions(pondokId);
    return await this.database
      .select()
      .from(this.table)
      .where(and(...conditions, eq(this.table.date, date), eq(this.table.periodId, periodId)))
      .then((res: unknown[]) => res[0]);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }

  async insert(values: typeof cashBooks.$inferInsert): Promise<void> {
    await this.databaseClient.insert(this.table).values(values);
  }

  async update(id: string, values: Partial<typeof cashBooks.$inferInsert>): Promise<void> {
    await this.databaseClient.update(this.table).set(values).where(eq(this.table.id, id));
  }
}
