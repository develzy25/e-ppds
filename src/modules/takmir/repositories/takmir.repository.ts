import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { takmirTable } from '../schemas/takmir.schema';
import { eq, and } from 'drizzle-orm';

export class TakmirRepository extends BaseRepository<typeof takmirTable> {
  constructor(dbClient?: DbClient) {
    super(takmirTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
