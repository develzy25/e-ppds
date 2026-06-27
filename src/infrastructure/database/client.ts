import { MemoryProvider } from './providers/memory.provider';
import { D1Provider } from './providers/d1.provider';
import { PostgresProvider } from './providers/postgres.provider';

export class DatabaseClient {
  private static instance: any;

  static getInstance(): any {
    if (!this.instance) {
      const providerType = process.env.DATABASE_PROVIDER || 'd1';
      
      console.log(`[Database Adapter] Initializing connection using ${providerType} provider...`);

      switch (providerType.toLowerCase()) {
        case 'memory':
          this.instance = new MemoryProvider().getDb();
          break;
        case 'postgres':
          this.instance = new PostgresProvider().getDb();
          break;
        case 'd1':
        default:
          this.instance = new D1Provider().getDb();
          break;
      }
    }
    return this.instance;
  }
}
