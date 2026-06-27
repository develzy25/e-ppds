import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { pembangunanTable } from '../schemas/pembangunan.schema';
import { eq, and } from 'drizzle-orm';

export class PembangunanRepository extends BaseRepository<typeof pembangunanTable> {
  constructor(dbClient?: DbClient) {
    super(pembangunanTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
