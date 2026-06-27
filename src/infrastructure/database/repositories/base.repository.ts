import { db } from '@/db';
import { eq, and, isNull, sql } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { PaginationMeta } from '@/shared/utils/api-response';

export interface PaginatedResult<TRecord> {
  data: TRecord[];
  meta: PaginationMeta;
}

/**
 * BaseRepository — kelas dasar untuk semua repositori PPDS ERP.
 *
 * Menyediakan:
 * - Akses terstandar ke database via `this.database`
 * - Helper `buildBaseConditions` untuk multi-tenant filtering + soft-delete
 * - Helper `countByConditions` untuk paginasi
 *
 * Metode CRUD spesifik (findAll, findById, create, update, softDelete)
 * diimplementasikan di setiap child repository karena setiap tabel memiliki
 * schema dan relasi JOIN yang berbeda.
 */
export type DbClient = any; // Can be BetterSQLite3Database or Tx

export abstract class BaseRepository<TTable extends SQLiteTable> {
  protected table: TTable;
  protected dbClient?: DbClient;

  constructor(table: TTable, dbClient?: DbClient) {
    this.table = table;
    this.dbClient = dbClient;
  }

  protected get database() {
    return this.dbClient || db;
  }

  /**
   * Membuat kondisi filter standar: active record (not soft-deleted) + pondokId tenant.
   * Menggunakan type assertion karena Drizzle generics tidak mendukung
   * structural constraint untuk kolom standar secara langsung.
   */
  protected buildBaseConditions(pondokId: string) {
    const t = this.table as any;
    return [
      eq(t.pondokId, pondokId),
      isNull(t.deletedAt),
    ];
  }

  /**
   * Menghitung jumlah record aktif (non-deleted) berdasarkan pondokId.
   */
  protected async countByConditions(pondokId: string): Promise<number> {
    const conditions = this.buildBaseConditions(pondokId);
    const result = await this.database
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(and(...conditions));
    return result[0]?.count || 0;
  }

  /**
   * Helper standar untuk membangun meta paginasi berdasarkan kontrak Enterprise.
   */
  protected buildPaginationMeta(
    totalItems: number,
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filters?: Record<string, any>
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      sortBy,
      sortOrder,
      filters
    };
  }

  // Expose database publicly for services to run raw queries (temporary for compatibility)
  public get databaseClient() {
    return this.database;
  }
}

