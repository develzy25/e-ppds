import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { labServices } from '@/modules/laboratorium/schemas/lab.schema'; // Using labServices as product for now
import { eq } from 'drizzle-orm';

export class PosProductRepository extends BaseRepository<typeof labServices> {
  constructor(dbClient?: DbClient) {
    super(labServices, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }

  async insert(values: typeof labServices.$inferInsert): Promise<void> {
    await this.databaseClient.insert(this.table).values(values);
  }

  async update(id: string, values: Partial<typeof labServices.$inferInsert>): Promise<void> {
    await this.databaseClient.update(this.table).set(values).where(eq(this.table.id, id));
  }
}
