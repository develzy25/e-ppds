import { AppError } from './app.error';
export class BusinessError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400);
    this.name = 'BusinessError';
  }
}