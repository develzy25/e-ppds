import { AppError } from './app.error';
export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}