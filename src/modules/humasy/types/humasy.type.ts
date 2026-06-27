import { humasyTable } from '../schemas/humasy.schema';

export type HumasyEntity = typeof humasyTable.$inferSelect;
export type NewHumasy = typeof humasyTable.$inferInsert;
