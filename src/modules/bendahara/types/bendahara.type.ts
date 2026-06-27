import { bendaharaTable } from '../schemas/bendahara.schema';

export type BendaharaEntity = typeof bendaharaTable.$inferSelect;
export type NewBendahara = typeof bendaharaTable.$inferInsert;
