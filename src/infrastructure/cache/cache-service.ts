export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(prefix?: string): Promise<void>;
}

/**
 * Basic Edge-Compatible Memory Cache Implementation.
 * In Phase D, this will be swapped out for Redis / Cloudflare KV via DI.
 */
export class MemoryCacheService implements ICacheService {
  private cache = new Map<string, { value: any; expiresAt: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(prefix?: string): Promise<void> {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton for easy usage. 
// Can be replaced by an IoC container injection later.
export const cacheService: ICacheService = new MemoryCacheService();
