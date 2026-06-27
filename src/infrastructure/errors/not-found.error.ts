import { AppError } from './app.error';
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} tidak ditemukan`, 404);
    this.name = 'NotFoundError';
  }
}