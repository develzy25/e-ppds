import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { posTransactions } from '@/modules/laboratorium/schemas/lab.schema'; // currently in lab schema
import { eq } from 'drizzle-orm';

export class PosTransactionRepository extends BaseRepository<typeof posTransactions> {
  constructor(dbClient?: DbClient) {
    super(posTransactions, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }

  async insert(values: typeof posTransactions.$inferInsert): Promise<void> {
    await this.databaseClient.insert(this.table).values(values);
  }

  async update(id: string, values: Partial<typeof posTransactions.$inferInsert>): Promise<void> {
    await this.databaseClient.update(this.table).set(values).where(eq(this.table.id, id));
  }
}
