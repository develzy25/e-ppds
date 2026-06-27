import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PendidikanRepository } from '../repositories/pendidikan.repository';

export class PendidikanService {
  constructor(private uow: IUnitOfWork) {}

  async getAllPendidikans(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new PendidikanRepository(tx);
      return [];
    });
  }
}
