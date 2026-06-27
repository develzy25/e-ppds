import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KesehatanRepository } from '../repositories/kesehatan.repository';

export class KesehatanService {
  constructor(private uow: IUnitOfWork) {}

  async getAllKesehatans(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new KesehatanRepository(tx);
      return [];
    });
  }
}
