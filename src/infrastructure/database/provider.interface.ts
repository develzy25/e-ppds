/**
 * Abstraksi database provider untuk mendukung berbagai backend
 * (D1, SQLite, Postgres) tanpa mengubah business logic.
 */
export interface IDatabaseProvider {
  /** Mengembalikan instance Drizzle ORM yang aktif */
  getDb(): unknown;
}
