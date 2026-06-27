import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { labServices } from '../schemas/lab.schema';
import { eq } from 'drizzle-orm';

export class LabServiceRepository extends BaseRepository<typeof labServices> {
  constructor(dbClient?: DbClient) {
    super(labServices, dbClient);
  }

  protected buildBaseConditions() {
    return [];
  }

  async findById(id: string) {
    const results = await this.database.select().from(this.table).where(eq((this.table as any).id, id));
    return results[0];
  }

  async create(data: any) {
    const results = await this.database.insert(this.table).values(data).returning();
    return results[0];
  }

  async update(id: string, data: any) {
    const results = await this.database.update(this.table).set(data).where(eq((this.table as any).id, id)).returning();
    return results[0];
  }
}
