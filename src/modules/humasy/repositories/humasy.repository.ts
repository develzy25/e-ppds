import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { humasyTable } from '../schemas/humasy.schema';
import { eq, and } from 'drizzle-orm';

export class HumasyRepository extends BaseRepository<typeof humasyTable> {
  constructor(dbClient?: DbClient) {
    super(humasyTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
