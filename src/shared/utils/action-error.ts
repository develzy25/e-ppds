import { AppError } from '@/infrastructure/errors';

/**
 * Standardized Server Action response contract.
 *
 * Semua server action WAJIB mengembalikan tipe ini agar UI layer
 * bisa menangani success/error secara konsisten.
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

interface NormalizedError {
  message: string;
  code: string;
}

/**
 * Normalisasi error dari unknown menjadi format yang aman untuk dikembalikan ke client.
 *
 * Mendukung:
 * - AppError (dan subclass: BusinessError, ValidationError, NotFoundError, ForbiddenError, ConflictError)
 * - Zod v4 ZodError
 * - Standard Error
 * - Unknown throw values (string, number, etc.)
 */
export function normalizeError(error: unknown): NormalizedError {
  // AppError hierarchy (BusinessError, ValidationError, etc.)
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  // Zod validation error (support Zod v4 structure)
  if (
    error instanceof Error &&
    error.name === 'ZodError' &&
    'issues' in error
  ) {
    const issues = (error as Error & { issues: Array<{ message: string }> }).issues;
    const messages = issues.map((issue) => issue.message).join('; ');
    return {
      message: messages || 'Validasi gagal',
      code: 'VALIDATION_ERROR',
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'INTERNAL_ERROR',
    };
  }

  // String throw
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Fallback for unknown types
  return {
    message: 'Terjadi kesalahan yang tidak terduga',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Helper untuk membuat error response dari server action.
 * Gunakan di dalam catch block.
 *
 * @example
 * ```ts
 * catch (error: unknown) {
 *   return errorResponse(error);
 * }
 * ```
 */
export function errorResponse(error: unknown): ActionResponse<never> {
  const normalized = normalizeError(error);
  return {
    success: false,
    error: normalized.message,
    code: normalized.code,
  };
}

/**
 * Helper untuk membuat success response dari server action.
 *
 * @example
 * ```ts
 * return successResponse(data);
 * ```
 */
export function successResponse<T>(data: T, meta?: ActionResponse['meta']): ActionResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}
