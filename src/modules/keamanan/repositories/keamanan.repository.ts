import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { keamananTable } from '../schemas/keamanan.schema';
import { eq, and } from 'drizzle-orm';

export class KeamananRepository extends BaseRepository<typeof keamananTable> {
  constructor(dbClient?: DbClient) {
    super(keamananTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
