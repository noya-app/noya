export class KeyedSet<K, V> {
  map = new Map<K, Set<V>>();

  private getSet(key: K) {
    const set = this.map.get(key) ?? new Set();
    this.map.set(key, set);
    return set;
  }

  add(key: K, value: V) {
    this.getSet(key).add(value);
  }

  delete(key: K, value: V) {
    this.getSet(key).delete(value);
  }

  forEach(key: K, callback: (value: V) => void) {
    this.getSet(key).forEach(callback);
  }

  size(key: K) {
    return this.getSet(key).size;
  }
}
