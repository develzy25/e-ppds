export class AppError extends Error {
  constructor(
    public code: string, 
    message: string, 
    public statusCode: number = 500,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}