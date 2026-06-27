import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KeamananRepository } from '../repositories/keamanan.repository';

export class KeamananService {
  constructor(private uow: IUnitOfWork) {}

  async getAllKeamanans(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new KeamananRepository(tx);
      return [];
    });
  }
}
