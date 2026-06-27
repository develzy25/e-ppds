import { mediaTable } from '../schemas/media.schema';

export type MediaEntity = typeof mediaTable.$inferSelect;
export type NewMedia = typeof mediaTable.$inferInsert;
