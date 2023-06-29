import { Emitter } from 'noya-fonts';
import { z } from 'zod';

const responseSchema = z.object({
  url: z.string(),
  metadata: z.object({
    color: z.string(),
  }),
  user: z.object({
    name: z.string(),
    url: z.string(),
  }),
  source: z.object({
    name: z.string(),
    url: z.string(),
  }),
});

type Response = z.infer<typeof responseSchema>;

export type Attribution = Pick<Response, 'user' | 'source'>;

export class RandomImageResolver {
  cache: Record<string, Promise<Response>> = {};
  emitters: Record<string, Emitter<[Response]>> = {};

  cacheKey(key: string, query: string) {
    return `${key}:${query}`;
  }

  getEmitter(key: string, query: string) {
    const cacheKey = this.cacheKey(key, query);

    if (!(cacheKey in this.emitters)) {
      this.emitters[cacheKey] = new Emitter();
    }

    return this.emitters[cacheKey];
  }

  async resolve(key: string, query: string) {
    const cacheKey = this.cacheKey(key, query);

    if (cacheKey in this.cache) return this.cache[cacheKey];

    const resolved = new Promise<Response>(async (resolve) => {
      const url = `/api/images/random?` + query;
      const response = await fetch(url);
      const resolved = response.json() as Promise<Response>;
      return resolve(resolved);
    });

    this.cache[cacheKey] = resolved;

    resolved.then((resolvedResponse) => {
      // Validate response
      const parsed = responseSchema.safeParse(resolvedResponse);

      if (!parsed.success) return;

      const emitter = this.getEmitter(key, query);

      emitter.emit(parsed.data);
    });

    return resolved;
  }

  clearCache(key: string) {
    const prefix = `${key}:`;

    this.cache = Object.fromEntries(
      Object.entries(this.cache).filter(
        ([cacheKey]) => !cacheKey.startsWith(prefix),
      ),
    );
  }

  addListener(key: string, query: string, callback: (url: Response) => void) {
    const emitter = this.getEmitter(key, query);

    return emitter.addListener(callback);
  }

  removeListener(
    key: string,
    query: string,
    callback: (url: Response) => void,
  ) {
    const emitter = this.getEmitter(key, query);

    emitter.removeListener(callback);
  }
}
