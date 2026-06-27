import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { posPayments } from '@/modules/laboratorium/schemas/lab.schema';
import { eq } from 'drizzle-orm';

export class PosPaymentRepository extends BaseRepository<typeof posPayments> {
  constructor(dbClient?: DbClient) {
    super(posPayments, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }

  async insert(values: typeof posPayments.$inferInsert): Promise<void> {
    await this.databaseClient.insert(this.table).values(values);
  }

  async update(id: string, values: Partial<typeof posPayments.$inferInsert>): Promise<void> {
    await this.databaseClient.update(this.table).set(values).where(eq(this.table.id, id));
  }
}
