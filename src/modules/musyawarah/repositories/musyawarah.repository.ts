import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { musyawarahTable } from '../schemas/musyawarah.schema';
import { eq, and } from 'drizzle-orm';

export class MusyawarahRepository extends BaseRepository<typeof musyawarahTable> {
  constructor(dbClient?: DbClient) {
    super(musyawarahTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
