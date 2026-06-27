import { db } from '@/db';
import { DbClient } from './repositories/base.repository';

import { RepositoryFactory } from './repository-factory';

export interface IUnitOfWork {
  execute<T>(callback: (repos: RepositoryFactory, tx: DbClient) => Promise<T>): Promise<T>;
}

/**
 * Unit of Work abstraction that delegates to Drizzle's transaction.
 * Service layers use this to ensure multiple repository calls are atomic.
 */
export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly database: DbClient = db) {}

  get repos() {
    return new RepositoryFactory(this.database);
  }

  async execute<T>(callback: (repos: RepositoryFactory, tx: DbClient) => Promise<T>): Promise<T> {
    // If the database client is already a transaction object, 
    // we don't start a nested transaction (unless supported).
    // Drizzle supports nested transactions via savepoints if using tx.transaction().
    return await this.database.transaction(async (tx: any) => {
      const factory = new RepositoryFactory(tx);
      return await callback(factory, tx);
    });
  }
}

// Global Singleton (can be overridden by DI in testing)
export const uow = new UnitOfWork();
