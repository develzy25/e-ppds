import { AppError } from './app.error';
export class ForbiddenError extends AppError {
  constructor(message: string = 'Akses ditolak') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}