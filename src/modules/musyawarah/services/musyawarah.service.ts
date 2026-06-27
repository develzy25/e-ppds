import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { MusyawarahRepository } from '../repositories/musyawarah.repository';

export class MusyawarahService {
  constructor(private uow: IUnitOfWork) {}

  async getAllMusyawarahs(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new MusyawarahRepository(tx);
      return [];
    });
  }
}
