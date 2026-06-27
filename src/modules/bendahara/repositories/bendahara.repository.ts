import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { bendaharaTable } from '../schemas/bendahara.schema';
import { eq, and } from 'drizzle-orm';

export class BendaharaRepository extends BaseRepository<typeof bendaharaTable> {
  constructor(dbClient?: DbClient) {
    super(bendaharaTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
