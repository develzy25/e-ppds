import { takmirTable } from '../schemas/takmir.schema';

export type TakmirEntity = typeof takmirTable.$inferSelect;
export type NewTakmir = typeof takmirTable.$inferInsert;
