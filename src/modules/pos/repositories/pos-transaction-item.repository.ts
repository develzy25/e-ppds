import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { posTransactionItems } from '@/modules/laboratorium/schemas/lab.schema';
import { eq } from 'drizzle-orm';

export class PosTransactionItemRepository extends BaseRepository<typeof posTransactionItems> {
  constructor(dbClient?: DbClient) {
    super(posTransactionItems, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }

  async insert(values: typeof posTransactionItems.$inferInsert): Promise<void> {
    await this.databaseClient.insert(this.table).values(values);
  }

  async update(id: string, values: Partial<typeof posTransactionItems.$inferInsert>): Promise<void> {
    await this.databaseClient.update(this.table).set(values).where(eq(this.table.id, id));
  }
}
