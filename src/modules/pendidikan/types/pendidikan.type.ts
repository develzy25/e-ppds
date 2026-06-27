import { pendidikanTable } from '../schemas/pendidikan.schema';

export type PendidikanEntity = typeof pendidikanTable.$inferSelect;
export type NewPendidikan = typeof pendidikanTable.$inferInsert;
