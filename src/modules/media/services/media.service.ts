import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { MediaRepository } from '../repositories/media.repository';

export class MediaService {
  constructor(private uow: IUnitOfWork) {}

  async getAllMedias(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      // Logic placeholder
      const repo = new MediaRepository(tx);
      return [];
    });
  }
}
