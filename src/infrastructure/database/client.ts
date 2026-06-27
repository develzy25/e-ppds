import { SQLiteProvider } from './providers/sqlite.provider';
import { D1Provider } from './providers/d1.provider';
import { PostgresProvider } from './providers/postgres.provider';

export class DatabaseClient {
  private static instance: any;

  static getInstance(): any {
    if (!this.instance) {
      const providerType = process.env.DATABASE_PROVIDER || 'sqlite';
      
      console.log(`[Database Adapter] Initializing connection using ${providerType} provider...`);

      switch (providerType.toLowerCase()) {
        case 'd1':
          this.instance = new D1Provider().getDb();
          break;
        case 'postgres':
          this.instance = new PostgresProvider().getDb();
          break;
        case 'sqlite':
        default:
          this.instance = new SQLiteProvider().getDb();
          break;
      }
    }
    return this.instance;
  }
}
