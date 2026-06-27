import { posTable } from '../schemas/pos.schema';

export type PosEntity = typeof posTable.$inferSelect;
export type NewPos = typeof posTable.$inferInsert;
