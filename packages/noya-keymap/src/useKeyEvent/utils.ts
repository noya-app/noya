export const NativeKeyMap = {
  // Alphabetical Keys
  A: 4,
  B: 5,
  C: 6,
  D: 7,
  E: 8,
  F: 9,
  G: 10,
  H: 11,
  I: 12,
  J: 13,
  K: 14,
  L: 15,
  M: 16,
  N: 17,
  O: 18,
  P: 19,
  Q: 20,
  R: 21,
  S: 22,
  T: 23,
  U: 24,
  V: 25,
  W: 26,
  X: 27,
  Y: 28,
  Z: 29,

  // Numerical Keys
  Alpha0: 39,
  Alpha1: 30,
  Alpha2: 31,
  Alpha3: 32,
  Alpha4: 33,
  Alpha5: 34,
  Alpha6: 35,
  Alpha7: 36,
  Alpha8: 37,
  Alpha9: 38,

  // Symbol Keys
  Backslash: 49,
  CloseBracket: 48,
  AlphaComma: 54,
  EqualSign: 46,
  Hyphen: 45,
  NonUSBackslash: 100,
  NonUSPound: 50,
  OpenBracket: 47,
  Period: 55,
  Quote: 52,
  Semicolor: 51,
  Separator: 159,
  Slash: 56,
  Spacebar: 44,

  // Modifier Keys
  CapsLock: 57,
  LeftAlt: 226,
  LeftControl: 224,
  LeftShift: 225,
  LockingCapsLock: 130,
  LockingNumLock: 131,
  LockingScrollLock: 132,
  RightAlt: 230,
  RightControl: 228,
  RightShift: 229,
  ScrollLock: 71,

  LeftCommand: 227,
  RightCommand: 231,

  // Navigation Keys
  LeftArrow: 80,
  RightArrow: 79,
  UpArrow: 82,
  DownArrow: 81,
  PageUp: 75,
  PageDown: 78,
  Home: 74,
  End: 77,
  DeleteForward: 76,
  DeleteOrBackspace: 42,
  Escape: 41,
  Insert: 73,
  Return: 158,
  Tab: 43,

  // Keypad Keys
  Keypad0: 98,
  Keypad1: 89,
  Keypad2: 90,
  Keypad3: 91,
  Keypad4: 92,
  Keypad5: 93,
  Keypad6: 94,
  Keypad7: 95,
  Keypad8: 96,
  Keypad9: 97,
  KeypadAsterisk: 85,
  KeypadComma: 133,
  KeypadEnter: 88,
  KeypadEqualSign: 103,
  KeypadEqualSignAS400: 134,
  KeypadHyphen: 86,
  KeypadNumLock: 83,
  KeypadPeriod: 99,
  KeypadPlus: 87,
  KeypadSlash: 84,
};

const VirtualKeyMap = {
  // Virtual Keys
  '0': [NativeKeyMap.Alpha0, NativeKeyMap.Keypad0],
  '1': [NativeKeyMap.Alpha1, NativeKeyMap.Keypad1],
  '2': [NativeKeyMap.Alpha2, NativeKeyMap.Keypad2],
  '3': [NativeKeyMap.Alpha3, NativeKeyMap.Keypad3],
  '4': [NativeKeyMap.Alpha4, NativeKeyMap.Keypad4],
  '5': [NativeKeyMap.Alpha5, NativeKeyMap.Keypad5],
  '6': [NativeKeyMap.Alpha6, NativeKeyMap.Keypad6],
  '7': [NativeKeyMap.Alpha7, NativeKeyMap.Keypad7],
  '8': [NativeKeyMap.Alpha8, NativeKeyMap.Keypad8],
  '9': [NativeKeyMap.Alpha9, NativeKeyMap.Keypad9],

  Alt: [NativeKeyMap.LeftAlt, NativeKeyMap.RightAlt],
  Control: [NativeKeyMap.LeftControl, NativeKeyMap.RightControl],
  Shift: [NativeKeyMap.LeftShift, NativeKeyMap.RightShift],
  Enter: [NativeKeyMap.Return, NativeKeyMap.KeypadEnter],
  Comma: [NativeKeyMap.AlphaComma, NativeKeyMap.KeypadComma],
  Command: [NativeKeyMap.LeftCommand, NativeKeyMap.RightCommand],
  Equal: [
    NativeKeyMap.EqualSign,
    NativeKeyMap.KeypadEqualSign,
    NativeKeyMap.KeypadEqualSignAS400,
  ],
};

const ReversedNativeKeyMap = (() => {
  const keyMap: { [key: number]: KeyName } = {};

  Object.entries(NativeKeyMap).forEach(([keyName, keyCode]) => {
    keyMap[keyCode] = keyName as KeyName;
  });

  return keyMap;
})();

const ReversedVirtualKeyMap = (() => {
  const keyMap: { [key: number]: KeyName } = {};

  Object.entries(VirtualKeyMap).forEach(([keyName, keyCodes]) => {
    keyCodes.forEach((keyCode) => {
      keyMap[keyCode] = keyName as KeyName;
    });
  });

  return keyMap;
})();

export const KeyMap = {
  ...NativeKeyMap,
  ...VirtualKeyMap,
};

type ValueOf<T> = T[keyof T];

export type KeyName = keyof typeof KeyMap;
export type KeyCode = ValueOf<typeof NativeKeyMap>;

export function keyCodeToKeyNames(keyCode: number): KeyName[] {
  const keys: KeyName[] = [];

  if (ReversedVirtualKeyMap[keyCode]) {
    keys.push(ReversedVirtualKeyMap[keyCode]);
  }

  if (ReversedNativeKeyMap[keyCode]) {
    keys.push(ReversedNativeKeyMap[keyCode]);
  }

  return keys;
}

export function keyNameToKeyCodes(keyName: KeyName): KeyCode[] {
  const codes: KeyCode[] = [];

  if (NativeKeyMap[keyName as keyof typeof NativeKeyMap]) {
    codes.push(NativeKeyMap[keyName as keyof typeof NativeKeyMap]);
  }

  if (VirtualKeyMap[keyName as keyof typeof VirtualKeyMap]) {
    VirtualKeyMap[keyName as keyof typeof VirtualKeyMap].forEach((code) => {
      codes.push(code);
    });
  }

  return codes;
}
