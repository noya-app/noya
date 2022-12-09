export class ObjectCache<V> {
  #cache: { [id: string]: { [name: string]: V } } = {};

  set(id: string, name: string, value: V) {
    this.#cache[id] ??= {};
    this.#cache[id][name] = value;
  }

  delete(id: string, name: string) {
    if (!(id in this.#cache) || !(name in this.#cache[id])) return;

    delete this.#cache[id][name];

    if (Object.keys(this.#cache[id]).length === 0) {
      delete this.#cache[id];
    }
  }

  get(id: string, name: string): V | undefined {
    return this.#cache[id]?.[name] as V | undefined;
  }

  entries(id: string) {
    return Object.entries(this.#cache[id] ?? {});
  }
}
