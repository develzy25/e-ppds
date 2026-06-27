import { IDatabaseProvider } from '../provider.interface';

export class MemoryProvider implements IDatabaseProvider {
  private db: any;

  constructor() {
    console.warn('MemoryProvider is a skeleton. Implement a local driver if needed.');
    this.db = {} as any;
  }

  getDb() {
    return this.db;
  }
}
