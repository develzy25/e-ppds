import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { TakmirRepository } from '../repositories/takmir.repository';

export class TakmirService {
  constructor(private uow: IUnitOfWork) {}

  async getAllTakmirs(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new TakmirRepository(tx);
      return [];
    });
  }
}
