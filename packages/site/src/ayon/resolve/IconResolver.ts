import { Emitter } from 'noya-fonts';
import { z } from 'zod';

const responseSchema = z.object({
  icons: z.array(z.string()),
});

type Response = z.infer<typeof responseSchema>;

export class IconResolver {
  cache: Record<string, Promise<Response>> = {};
  emitters: Record<string, Emitter<[string]>> = {};

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

    const response = await fetch(
      `https://api.iconify.design/search?limit=32&query=${encodeURIComponent(
        query,
      )}`,
    );
    const resolved = response.json() as Promise<Response>;

    this.cache[key] = resolved;

    resolved.then((resolvedResponse) => {
      // Validate response
      const parsed = responseSchema.safeParse(resolvedResponse);

      if (!parsed.success) return;

      const emitter = this.getEmitter(key, query);

      // icon looks like "mdi:icon-name"
      const icon =
        resolvedResponse.icons.find((icon) => icon === query) ??
        resolvedResponse.icons.find((icon) => icon.split(':')[1] === query) ??
        resolvedResponse.icons.at(0);

      if (icon) {
        const [iconPrefix, iconName] = icon.split(':');

        emitter.emit(
          `https://api.iconify.design/${iconPrefix}/${iconName}.svg`,
        );
      }
    });

    return resolved;
  }

  addListener(key: string, query: string, callback: (url: string) => void) {
    const emitter = this.getEmitter(key, query);

    return emitter.addListener(callback);
  }

  removeListener(key: string, query: string, callback: (url: string) => void) {
    const emitter = this.getEmitter(key, query);

    emitter.removeListener(callback);
  }
}
