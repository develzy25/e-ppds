import { bumpTable } from '../schemas/bump.schema';

export type BumpEntity = typeof bumpTable.$inferSelect;
export type NewBump = typeof bumpTable.$inferInsert;
