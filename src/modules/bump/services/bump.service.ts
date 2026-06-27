import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { BumpRepository } from '../repositories/bump.repository';

export class BumpService {
  constructor(private uow: IUnitOfWork) {}

  async getAllBumps(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new BumpRepository(tx);
      return [];
    });
  }
}
