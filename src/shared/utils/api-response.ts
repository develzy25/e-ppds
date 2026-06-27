import { NextResponse } from 'next/server';
import { AppError } from '@/modules/core/errors/app.error';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | null;
  meta: PaginationMeta | null;
}

/**
 * @deprecated Gunakan function-based helpers (ok, created, badRequest, dll) dari file ini.
 * Class ini dipertahankan hanya untuk backward compatibility.
 */
export class ResponseHelper {
  static success<T>(data: T, message: string = 'Success', meta: PaginationMeta | null = null): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        errors: null,
        meta,
      },
      { status: 200 }
    );
  }

  static created<T>(data: T, message: string = 'Data created successfully'): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        errors: null,
        meta: null,
      },
      { status: 201 }
    );
  }

  static error(error: unknown): NextResponse<ApiResponse<null>> {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: null,
          errors: error.errors || null,
          meta: null,
        },
        { status: error.statusCode }
      );
    }

    // Default unhandled error (500)
    console.error('[Unhandled Error]', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        message: process.env.NODE_ENV === 'development' ? message : 'Internal Server Error',
        data: null,
        errors: null,
        meta: null,
      },
      { status: 500 }
    );
  }
}




export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface APIResponseMeta {
  requestId: string;
  correlationId: string;
  timestamp: string;
  duration: number;
  version: string;
  cache: 'HIT' | 'MISS' | 'BYPASS';
  queryCount: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: APIError | null;
  meta: APIResponseMeta;
}

function createMeta(customMeta?: Partial<APIResponseMeta>): APIResponseMeta {
  return {
    requestId: customMeta?.requestId || 'req-unknown',
    correlationId: customMeta?.correlationId || 'corr-unknown',
    timestamp: customMeta?.timestamp || new Date().toISOString(),
    duration: customMeta?.duration || 0,
    version: customMeta?.version || '1.0.0',
    cache: customMeta?.cache || 'BYPASS',
    queryCount: customMeta?.queryCount || 0,
  };
}

export function ok<T>(data: T, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<T> = {
    success: true,
    data,
    error: null,
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 200 });
}

export function created<T>(data: T, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<T> = {
    success: true,
    data,
    error: null,
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 201 });
}

export function accepted<T>(data: T, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<T> = {
    success: true,
    data,
    error: null,
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 202 });
}

export function badRequest(code: string, message: string, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 400 });
}

export function unauthorized(code: string, message: string, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 401 });
}

export function forbidden(code: string, message: string, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 403 });
}

export function notFound(code: string, message: string, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 404 });
}

export function conflict(code: string, message: string, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 409 });
}

export function validationError(code: string, message: string, details: Record<string, unknown>, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message, details },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 422 });
}

export function internalError(code: string, message: string, customMeta?: Partial<APIResponseMeta>) {
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error: { code, message },
    meta: createMeta(customMeta),
  };
  return NextResponse.json(body, { status: 500 });
}
