import { headers } from 'next/headers';
import type { APIResponseMeta } from './api-response';

/**
 * Mengambil metadata request dari header yang disisipkan oleh proxy.ts.
 * Digunakan di semua API route handler untuk konsistensi tracing.
 */
export async function getRequestMeta(): Promise<Partial<APIResponseMeta>> {
  try {
    const h = await headers();
    return {
      requestId: h.get('x-request-id') || 'req-unknown',
      correlationId: h.get('x-correlation-id') || 'corr-unknown',
      version: h.get('x-client-version') || '1.0.0',
      duration: Date.now() - Number(h.get('x-start-time') || Date.now()),
    };
  } catch {
    return {};
  }
}
