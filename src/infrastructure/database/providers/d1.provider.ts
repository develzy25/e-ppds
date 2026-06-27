import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';
import { IDatabaseProvider } from '../provider.interface';

export class D1Provider implements IDatabaseProvider {
  private db: any;

  constructor() {
    // Access the D1 binding exposed by OpenNext/Cloudflare runtime
    const binding = process.env.DB || (globalThis as any).DB;
    
    if (!binding) {
      console.warn('D1 binding not found in process.env.DB or globalThis.DB. Database queries may fail.');
    }
    
    // We cast to any here to satisfy TS when running locally without bindings
    this.db = drizzle(binding as any, { schema });
  }

  getDb() {
    return this.db;
  }
}
