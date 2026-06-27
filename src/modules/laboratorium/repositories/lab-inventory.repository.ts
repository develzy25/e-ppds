import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { labInventory } from '../schemas/lab.schema';
import { eq } from 'drizzle-orm';

export class LabInventoryRepository extends BaseRepository<typeof labInventory> {
  constructor(dbClient?: DbClient) {
    super(labInventory, dbClient);
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
