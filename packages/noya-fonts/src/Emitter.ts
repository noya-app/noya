export class Emitter {
  private listeners: (() => void)[] = [];

  addListener(f: () => void) {
    this.listeners.push(f);
  }

  removeListener(f: () => void) {
    const index = this.listeners.indexOf(f);

    if (index === -1) return;

    this.listeners.splice(index, 1);
  }

  emit() {
    this.listeners.forEach((l) => l());
  }
}
