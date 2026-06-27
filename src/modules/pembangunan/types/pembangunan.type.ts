import { pembangunanTable } from '../schemas/pembangunan.schema';

export type PembangunanEntity = typeof pembangunanTable.$inferSelect;
export type NewPembangunan = typeof pembangunanTable.$inferInsert;
