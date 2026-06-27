import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { posTable } from '../schemas/pos.schema';
import { eq, and } from 'drizzle-orm';

export class PosRepository extends BaseRepository<typeof posTable> {
  constructor(dbClient?: DbClient) {
    super(posTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
