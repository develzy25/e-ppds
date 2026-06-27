import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { dmsTable } from '../schemas/dms.schema';
import { eq, and } from 'drizzle-orm';

export class DmsRepository extends BaseRepository<typeof dmsTable> {
  constructor(dbClient?: DbClient) {
    super(dmsTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
