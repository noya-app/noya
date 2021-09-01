type EmitterConfiguration = {
  bufferEventsIfNoListeners: boolean;
};

export class Emitter<T extends any[] = []> {
  constructor(options: Partial<EmitterConfiguration> = {}) {
    this.bufferEventsIfNoListeners = options.bufferEventsIfNoListeners ?? false;
  }

  private bufferEventsIfNoListeners: boolean;

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

    if (this.bufferedEvents.length > 0) {
      const eventsToEmit = this.bufferedEvents;

      this.bufferedEvents = [];

      eventsToEmit.forEach((event) => {
        this.emit(...event);
      });
    }

    return () => this.removeListener(f);
  };

  removeListener = (f: (...args: T) => void) => {
    const index = this.listeners.indexOf(f);

    if (index === -1) return;

    this.listeners.splice(index, 1);
  };

  emit = (...args: T) => {
    if (this.listeners.length === 0) {
      this.bufferedEvents.push(args);

      return;
    }

    this.listeners.forEach((l) => l(...args));
  };

  private bufferedEvents: T[] = [];
}
