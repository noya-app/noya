export type PlatformName =
  | 'ios'
  | 'android'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'key';

export interface KeyModifiers {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export type PlatformKeyboardShortcut = Partial<Record<PlatformName, string>>;
export type KeyCommandPriority = 'standard' | 'system';

export type KeyEventName = 'keydown' | 'keyup' | 'keypress';

export type KeyCommandCallback = () => void | 'fallthrough';

export interface NativeKeyCommand {
  title: string;
  menuName: string;
  callback: KeyCommandCallback;
  priority?: KeyCommandPriority;
}

export type KeyCommand = KeyCommandCallback | NativeKeyCommand;

export type KeyMap = Record<string, KeyCommand>;

export type Shortcuts =
  | [string | PlatformKeyboardShortcut, KeyCommand][]
  | KeyMap;

export interface KeyboardEventListener {
  addEventListener: (
    name: string,
    handler: (keyboardEvent: KeyboardEvent) => void,
  ) => void;
  removeEventListener: (
    name: string,
    handler: (keyboardEvent: KeyboardEvent) => void,
  ) => void;
}

export interface KeyCommandOptions {
  eventName?: KeyEventName;
  eventListener?: KeyboardEventListener;
}
