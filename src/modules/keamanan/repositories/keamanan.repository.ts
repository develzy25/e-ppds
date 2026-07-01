import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { keamananPermits, keamananOffenses } from '../schemas/keamanan.schema';
import { masterSantri, masterRoom } from '@/modules/master/schemas/master.schema';
import { eq, desc } from 'drizzle-orm';

export class KeamananPermitRepository extends BaseRepository<typeof keamananPermits> {
  constructor(tx?: DbClient) {
    super(keamananPermits, tx);
  }

  async findAllWithSantri() {
    return await this.database
      .select({
        id: keamananPermits.id,
        santriId: keamananPermits.santriId,
        santriName: masterSantri.fullName,
        kamarInfo: masterRoom.name,
        type: keamananPermits.type,
        startDate: keamananPermits.startDate,
        endDate: keamananPermits.endDate,
        status: keamananPermits.status,
        notes: keamananPermits.notes,
        checkoutAt: keamananPermits.checkoutAt,
        createdAt: keamananPermits.createdAt,
      })
      .from(keamananPermits)
      .innerJoin(masterSantri, eq(keamananPermits.santriId, masterSantri.id))
      .leftJoin(masterRoom, eq(masterSantri.roomId, masterRoom.id))
      .orderBy(desc(keamananPermits.createdAt));
  }
}

export class KeamananOffenseRepository extends BaseRepository<typeof keamananOffenses> {
  constructor(tx?: DbClient) {
    super(keamananOffenses, tx);
  }

  async findAllWithSantri() {
    return await this.database
      .select({
        id: keamananOffenses.id,
        santriId: keamananOffenses.santriId,
        santriName: masterSantri.fullName,
        kamarInfo: masterRoom.name,
        category: keamananOffenses.category,
        description: keamananOffenses.description,
        points: keamananOffenses.points,
        date: keamananOffenses.date,
        handlerName: keamananOffenses.handlerName,
        createdAt: keamananOffenses.createdAt,
      })
      .from(keamananOffenses)
      .innerJoin(masterSantri, eq(keamananOffenses.santriId, masterSantri.id))
      .leftJoin(masterRoom, eq(masterSantri.roomId, masterRoom.id))
      .orderBy(desc(keamananOffenses.createdAt));
  }
}
