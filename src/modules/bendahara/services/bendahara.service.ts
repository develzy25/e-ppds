import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { BendaharaRepository } from '../repositories/bendahara.repository';

export class BendaharaService {
  constructor(private uow: IUnitOfWork) {}

  async getAllBendaharas(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new BendaharaRepository(tx);
      return [];
    });
  }
}
