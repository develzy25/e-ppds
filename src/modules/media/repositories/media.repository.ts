import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { mediaTable } from '../schemas/media.schema';
import { eq, and } from 'drizzle-orm';

export class MediaRepository extends BaseRepository<typeof mediaTable> {
  constructor(dbClient?: DbClient) {
    super(mediaTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
