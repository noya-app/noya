export class Emitter<T extends any[] = []> {
  private listeners: ((...args: T) => void)[] = [];

  addListener = (f: (...args: T) => void) => {
    this.listeners.push(f);
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
