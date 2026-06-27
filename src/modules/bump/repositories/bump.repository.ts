import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { bumpTable } from '../schemas/bump.schema';
import { eq, and } from 'drizzle-orm';

export class BumpRepository extends BaseRepository<typeof bumpTable> {
  constructor(dbClient?: DbClient) {
    super(bumpTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
