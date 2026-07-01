import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleProxy } from 'drizzle-orm/sqlite-proxy';
import * as schema from '@/db/schema';
import { IDatabaseProvider } from '../provider.interface';

export class D1Provider implements IDatabaseProvider {
  private db: any;

  constructor() {
    // Access the D1 binding exposed by OpenNext/Cloudflare runtime
    const binding = process.env.DB || (globalThis as any).DB;
    
    if (binding) {
      console.log('⚡ D1 Native Binding found. Using native Cloudflare D1 provider.');
      this.db = drizzleD1(binding as any, { schema });
    } else {
      const workerUrl = process.env.D1_WORKER_API_URL || '';
      const workerToken = process.env.D1_WORKER_API_TOKEN || '';
      const retryCount = parseInt(process.env.D1_RETRY || '3', 10);
      const timeoutMs = parseInt(process.env.D1_TIMEOUT || '30000', 10);

      if (!workerUrl) {
        console.warn('❌ D1 Native Binding and D1_WORKER_API_URL are both missing. Database queries will fail.');
        this.db = drizzleD1({} as any, { schema }); // fallback
        return;
      }

      console.log(`🔌 D1 Native Binding not found. Falling back to HTTP Gateway proxy: ${workerUrl}`);

      this.db = drizzleProxy(async (sql, params, method) => {
        let lastError = null;
        
        for (let attempt = 1; attempt <= retryCount; attempt++) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          const reqId = crypto.randomUUID().substring(0, 8);
          const startTime = Date.now();
          
          try {
            const response = await fetch(`${workerUrl}/db/query`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${workerToken}`,
                'x-timestamp': Date.now().toString(),
                'x-request-id': reqId
              },
              body: JSON.stringify({ sql, params, method }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();
            const duration = Date.now() - startTime;
            
            console.log(`[DB:${reqId}] ${method} executed in ${duration}ms - Status: ${response.status}`);
            
            if (!data.success) {
              console.error(`[DB:${reqId}] D1 Query Error:`, data);
              throw new Error(data.message || 'Database error');
            }

            let rows = data.rows;
            if (Array.isArray(rows)) {
              rows = rows.map((row: any) => {
                if (row && typeof row === 'object' && !Array.isArray(row)) {
                  return Object.values(row);
                }
                return row;
              });
            } else if (rows && typeof rows === 'object') {
              rows = Object.values(rows);
            }

            return { rows };
          } catch (e: any) {
            clearTimeout(timeoutId);
            lastError = e;
            const duration = Date.now() - startTime;
            console.warn(`[DB:${reqId}] Attempt ${attempt} failed after ${duration}ms: ${e.message}`);
            
            if (attempt < retryCount) {
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
          }
        }

        console.error('D1 Connection completely failed after retries');
        throw lastError || new Error('D1 connection failed');
      }, { schema });
    }
  }

  getDb() {
    return this.db;
  }
}
