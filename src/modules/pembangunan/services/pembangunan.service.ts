import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PembangunanRepository } from '../repositories/pembangunan.repository';

export class PembangunanService {
  constructor(private uow: IUnitOfWork) {}

  async getAllPembangunans(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new PembangunanRepository(tx);
      return [];
    });
  }
}
