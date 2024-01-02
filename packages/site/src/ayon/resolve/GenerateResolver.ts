import { Emitter } from '@noya-app/noya-fonts';
import { NOYA_HOST } from '../../utils/noyaClient';

export class GenerateResolver {
  cache: Record<string, Promise<string>> = {};
  emitters: Record<string, Emitter<[string]>> = {};
  debounceTimers: Record<string, NodeJS.Timeout> = {};
  cacheKey(key: string, prompt: string) {
    return `${key}:${prompt}`;
  }

  getEmitter(key: string, prompt: string) {
    const cacheKey = this.cacheKey(key, prompt);

    if (!(cacheKey in this.emitters)) {
      this.emitters[cacheKey] = new Emitter();
    }

    return this.emitters[cacheKey];
  }

  async resolve(key: string, prompt: string) {
    if (key in this.debounceTimers) clearTimeout(this.debounceTimers[key]);
    this.debounceTimers[key] = setTimeout(() => {
      this._resolve(key, prompt);
    }, 1000);
  }

  async _resolve(key: string, prompt: string) {
    const cacheKey = this.cacheKey(key, prompt);

    if (cacheKey in this.cache) return this.cache[cacheKey];

    const response = await fetch(
      `${NOYA_HOST}/api/generate/text?prompt=${encodeURIComponent(prompt)}`,
      { credentials: 'include' },
    );
    const resolved = response.json();

    this.cache[key] = resolved;

    resolved.then((resolvedResponse) => {
      const emitter = this.getEmitter(key, prompt);
      emitter.emit(resolvedResponse.choices[0].text);
    });

    return resolved;
  }

  addListener(key: string, prompt: string, callback: (text: string) => void) {
    const emitter = this.getEmitter(key, prompt);

    return emitter.addListener(callback);
  }

  removeListener(
    key: string,
    prompt: string,
    callback: (text: string) => void,
  ) {
    const emitter = this.getEmitter(key, prompt);

    emitter.removeListener(callback);
  }
}
