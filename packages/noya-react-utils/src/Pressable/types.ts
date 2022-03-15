export interface PressableEvent {
  stopPropagation: () => void;
  preventDefault: () => void;
}

export type PressableHandler = (event: PressableEvent) => void;
