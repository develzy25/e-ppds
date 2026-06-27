import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { laboratoriumTable } from '../schemas/laboratorium.schema';
import { eq, and } from 'drizzle-orm';

export class LaboratoriumRepository extends BaseRepository<typeof laboratoriumTable> {
  constructor(dbClient?: DbClient) {
    super(laboratoriumTable, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
