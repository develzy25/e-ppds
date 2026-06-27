import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { pendidikanTable } from '../schemas/pendidikan.schema';
import { eq, and } from 'drizzle-orm';

export class PendidikanRepository extends BaseRepository<typeof pendidikanTable> {
  constructor(dbClient?: DbClient) {
    super(pendidikanTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
