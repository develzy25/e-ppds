import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { labSessions, labComputers } from '../schemas/lab.schema';

export class BillingRepository extends BaseRepository<typeof labSessions> {
  constructor(dbClient?: DbClient) {
    super(labSessions, dbClient);
  }
}
