import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { kesehatanTable } from '../schemas/kesehatan.schema';
import { eq, and } from 'drizzle-orm';

export class KesehatanRepository extends BaseRepository<typeof kesehatanTable> {
  constructor(dbClient?: DbClient) {
    super(kesehatanTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
