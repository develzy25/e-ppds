import { kesehatanTable } from '../schemas/kesehatan.schema';

export type KesehatanEntity = typeof kesehatanTable.$inferSelect;
export type NewKesehatan = typeof kesehatanTable.$inferInsert;
