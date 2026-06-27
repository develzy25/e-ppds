import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { HumasyRepository } from '../repositories/humasy.repository';

export class HumasyService {
  constructor(private uow: IUnitOfWork) {}

  async getAllHumasys(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new HumasyRepository(tx);
      return [];
    });
  }
}
