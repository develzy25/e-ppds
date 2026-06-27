import { dmsTable } from '../schemas/dms.schema';

export type DmsEntity = typeof dmsTable.$inferSelect;
export type NewDms = typeof dmsTable.$inferInsert;
