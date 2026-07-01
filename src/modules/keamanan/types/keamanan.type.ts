import { keamananPermits, keamananOffenses } from '../schemas/keamanan.schema';

export type KeamananPermitEntity = typeof keamananPermits.$inferSelect;
export type NewKeamananPermit = typeof keamananPermits.$inferInsert;

export type KeamananOffenseEntity = typeof keamananOffenses.$inferSelect;
export type NewKeamananOffense = typeof keamananOffenses.$inferInsert;
