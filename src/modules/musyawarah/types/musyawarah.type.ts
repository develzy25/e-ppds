import { musyawarahTable } from '../schemas/musyawarah.schema';

export type MusyawarahEntity = typeof musyawarahTable.$inferSelect;
export type NewMusyawarah = typeof musyawarahTable.$inferInsert;
