import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { systemAuditLogs } from '@/modules/core/schemas/core.schema';

export class AuditRepository extends BaseRepository<typeof systemAuditLogs> {
  constructor(dbClient?: DbClient) {
    super(systemAuditLogs, dbClient);
  }

  async insert(data: typeof systemAuditLogs.$inferInsert): Promise<void> {
    await this.database.insert(this.table).values(data);
  }
}
