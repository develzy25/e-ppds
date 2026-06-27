type EventHandler<T = any> = (payload: T) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T>(eventName: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventName)?.delete(handler);
    };
  }

  public async publish<T>(eventName: string, payload: T): Promise<void> {
    const handlers = this.listeners.get(eventName);
    if (!handlers) return;

    const promises = Array.from(handlers).map(handler => {
      try {
        return Promise.resolve(handler(payload)).catch(err => {
          console.error(`[EventBus] Async Error handling event ${eventName}:`, err);
        });
      } catch (err) {
        console.error(`[EventBus] Sync Error handling event ${eventName}:`, err);
        return Promise.resolve();
      }
    });

    // In Cloudflare Workers/Edge, we await this so the worker doesn't die mid-execution.
    // If true asynchronous fire-and-forget is needed, it should be wrapped in waitUntil() at the edge route.
    await Promise.allSettled(promises);
  }
}

export const domainEvents = EventBus.getInstance();
