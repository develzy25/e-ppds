import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '@/db/schema';
import { IDatabaseProvider } from '../provider.interface';

export class D1Provider implements IDatabaseProvider {
  private db: any;
  private workerUrl: string;
  private workerToken: string;
  private retryCount: number;
  private timeoutMs: number;

  constructor() {
    this.workerUrl = process.env.D1_WORKER_API_URL || '';
    this.workerToken = process.env.D1_WORKER_API_TOKEN || '';
    this.retryCount = parseInt(process.env.D1_RETRY || '3', 10);
    this.timeoutMs = parseInt(process.env.D1_TIMEOUT || '30000', 10);

    this.db = drizzle(async (sql, params, method) => {
      let lastError = null;
      
      // Retry Mechanism & Timeout
      for (let attempt = 1; attempt <= this.retryCount; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        
        const reqId = crypto.randomUUID().substring(0, 8);
        const startTime = Date.now();
        
        try {
          const response = await fetch(`${this.workerUrl}/db/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.workerToken}`,
              'x-timestamp': Date.now().toString(),
              'x-request-id': reqId
            },
            body: JSON.stringify({ sql, params, method }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const data = await response.json();
          const duration = Date.now() - startTime;
          
          // Query Logging
          console.log(`[DB:${reqId}] ${method} executed in ${duration}ms - Status: ${response.status}`);
          
          if (!data.success) {
            console.error(`[DB:${reqId}] D1 Query Error:`, data);
            throw new Error(data.message || 'Database error');
          }

          return { rows: data.rows };
        } catch (e: any) {
          clearTimeout(timeoutId);
          lastError = e;
          const duration = Date.now() - startTime;
          console.warn(`[DB:${reqId}] Attempt ${attempt} failed after ${duration}ms: ${e.message}`);
          
          if (attempt < this.retryCount) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          }
        }
      }

      console.error('D1 Connection completely failed after retries');
      return { rows: [] }; // Return empty or throw based on your strictness requirements
    }, { schema });
  }

  getDb() {
    return this.db;
  }
}
