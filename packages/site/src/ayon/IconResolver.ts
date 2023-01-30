import { Emitter } from 'noya-fonts';

export class IconResolver {
  cache: Record<string, Promise<string>> = {};
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
    const resolved = response.json();

    this.cache[key] = resolved;

    resolved.then((resolvedResponse) => {
      const emitter = this.getEmitter(key, query);
      if (resolvedResponse.icons.length > 0) {
        const [iconPrefix, iconName] = resolvedResponse.icons[0].split(':');
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
