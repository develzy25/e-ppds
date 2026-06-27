import { IDatabaseProvider } from '../provider.interface';

export class PostgresProvider implements IDatabaseProvider {
  constructor() {
    console.warn('Postgres Provider is not yet implemented for PPDS ERP');
  }

  getDb() {
    throw new Error('Postgres not yet supported in this version');
  }
}
