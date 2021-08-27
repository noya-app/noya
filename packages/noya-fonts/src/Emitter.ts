export class Emitter<T extends any[] = []> {
  private listeners: ((...args: T) => void)[] = [];

  addListener = (f: (...args: T) => void, options: { once?: boolean } = {}) => {
    if (options.once) {
      const handler = (...args: T) => {
        this.removeListener(handler);
        return f(...args);
      };
      this.listeners.push(handler);
    } else {
      this.listeners.push(f);
    }
  };

  removeListener = (f: (...args: T) => void) => {
    const index = this.listeners.indexOf(f);

    if (index === -1) return;

    this.listeners.splice(index, 1);
  };

  emit = (...args: T) => {
    this.listeners.forEach((l) => l(...args));
  };
}
