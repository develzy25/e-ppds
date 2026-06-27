import { keamananTable } from '../schemas/keamanan.schema';

export type KeamananEntity = typeof keamananTable.$inferSelect;
export type NewKeamanan = typeof keamananTable.$inferInsert;
