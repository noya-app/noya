import { Emitter } from 'noya-fonts';

function getRedirectURL(url: string) {
  return new Promise<string>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.onload = () => {
      resolve(xhr.responseURL);
    };

    xhr.send(null);
  });
}

export class RedirectResolver {
  cache: Record<string, Promise<string>> = {};
  emitters: Record<string, Emitter<[string]>> = {};

  cacheKey(key: string, url: string) {
    return `${key}:${url}`;
  }

  getEmitter(key: string, url: string) {
    const cacheKey = this.cacheKey(key, url);

    if (!(cacheKey in this.emitters)) {
      this.emitters[cacheKey] = new Emitter();
    }

    return this.emitters[cacheKey];
  }

  async resolve(key: string, url: string) {
    const cacheKey = this.cacheKey(key, url);

    if (cacheKey in this.cache) return this.cache[cacheKey];

    const resolved = getRedirectURL(url);

    this.cache[key] = resolved;

    resolved.then((resolvedUrl) => {
      const emitter = this.getEmitter(key, url);

      emitter.emit(resolvedUrl);
    });

    return resolved;
  }

  addListener(key: string, url: string, callback: (url: string) => void) {
    const emitter = this.getEmitter(key, url);

    return emitter.addListener(callback);
  }

  removeListener(key: string, url: string, callback: (url: string) => void) {
    const emitter = this.getEmitter(key, url);

    emitter.removeListener(callback);
  }
}
