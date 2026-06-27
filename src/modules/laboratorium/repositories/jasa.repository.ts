import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { labServices } from '../schemas/lab.schema';

export class JasaRepository extends BaseRepository<typeof labServices> {
  constructor(dbClient?: DbClient) {
    super(labServices, dbClient);
  }
}
