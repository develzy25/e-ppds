export interface Env {
  DB: D1Database;
  API_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const reqId = crypto.randomUUID().substring(0, 8);
    const startTime = Date.now();

    const respond = (status: number, data: any) => {
      const duration = Date.now() - startTime;
      console.log(`[${reqId}] ${request.method} ${path} - ${status} (${duration}ms)`);
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const respondError = (status: number, code: string, message: string) => {
      return respond(status, {
        success: false,
        code,
        message,
        requestId: reqId,
      });
    };

    if (request.method === 'GET' && path === '/db/health') {
      return respond(200, {
        status: 'healthy',
        latency: Date.now() - startTime,
        database: 'PPDS-D1',
        version: '1.0'
      });
    }

    if (request.method === 'GET' && path === '/db/version') {
      return respond(200, { version: '1.0.0', gateway: 'PPDS-Enterprise-Gateway' });
    }

    if (request.method !== 'POST') {
      return respondError(405, 'DB-405', 'Method not allowed');
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
      return respondError(401, 'DB-401', 'Unauthorized');
    }

    const timestamp = request.headers.get('x-timestamp');
    if (!timestamp || (Date.now() - parseInt(timestamp)) > 60000) {
      console.log(`[${reqId}] Warning: Missing or expired timestamp`);
    }

    try {
      if (path === '/db/query') {
        const body: any = await request.json();
        const { sql, params, method } = body;
        
        if (!sql) return respondError(400, 'DB-400', 'Missing SQL query');

        const stmt = env.DB.prepare(sql).bind(...(params || []));
        let result;

        if (method === 'all') {
          const { results } = await stmt.all();
          result = results;
        } else if (method === 'run') {
          const { meta } = await stmt.run();
          result = meta;
        } else if (method === 'get') {
          result = await stmt.first();
        } else if (method === 'values') {
          const { results } = await stmt.all();
          result = results.map(Object.values);
        } else {
           const { results } = await stmt.all();
           result = results;
        }

        return respond(200, { success: true, rows: result, requestId: reqId });
      }

      if (path === '/db/transaction' || path === '/db/batch') {
        const body: any = await request.json();
        const queries = body.queries || [];
        
        if (!Array.isArray(queries) || queries.length === 0) {
          return respondError(400, 'DB-400', 'Empty batch or transaction');
        }

        const statements = queries.map((q: any) => env.DB.prepare(q.sql).bind(...(q.params || [])));
        const batchResults = await env.DB.batch(statements);
        
        const results = batchResults.map((r: any) => r.results);
        return respond(200, { success: true, rows: results, requestId: reqId });
      }

      return respondError(404, 'DB-404', 'Endpoint not found');
    } catch (error: any) {
      console.error(`[${reqId}] Execution Error:`, error.message);
      return respondError(500, 'DB-500', 'Database Execution Failed');
    }
  },
};

