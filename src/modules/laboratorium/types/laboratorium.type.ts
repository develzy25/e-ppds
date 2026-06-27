import { laboratoriumTable } from '../schemas/laboratorium.schema';

export type LaboratoriumEntity = typeof laboratoriumTable.$inferSelect;
export type NewLaboratorium = typeof laboratoriumTable.$inferInsert;
