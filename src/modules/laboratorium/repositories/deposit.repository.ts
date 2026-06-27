import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { cashDeposits } from '../schemas/lab.schema';
import { eq } from 'drizzle-orm';

export class DepositRepository extends BaseRepository<typeof cashDeposits> {
  constructor(dbClient?: DbClient) {
    super(cashDeposits, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }

  async insert(values: typeof cashDeposits.$inferInsert): Promise<void> {
    await this.databaseClient.insert(this.table).values(values);
  }

  async update(id: string, values: Partial<typeof cashDeposits.$inferInsert>): Promise<void> {
    await this.databaseClient.update(this.table).set(values).where(eq(this.table.id, id));
  }
}
