import { PlatformName } from './platform';

export function parseKeyName(
  name: string,
  platform: PlatformName,
): { key: string; modifiers: KeyModifiers } {
  const parts = name.split(/-(?!$)/);

  let result = parts[parts.length - 1];

  if (result === 'Space') result = ' ';

  const modifiers: KeyModifiers = {
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
  };

  if (parts.length === 1) {
    if (/^(cmd|meta)$/i.test(result)) return { key: 'Meta', modifiers };
    else if (/^alt$/i.test(result)) return { key: 'Alt', modifiers };
    else if (/^(ctrl|control)$/i.test(result))
      return { key: 'Ctrl', modifiers };
    else if (/^shift$/i.test(result)) return { key: 'Shift', modifiers };
    else if (/^mod$/i.test(result)) {
      if (platform === 'mac') return { key: 'Meta', modifiers };
      else return { key: 'Ctrl', modifiers };
    }
  }

  for (let i = 0; i < parts.length - 1; ++i) {
    const mod = parts[i];
    if (/^(cmd|meta)$/i.test(mod)) modifiers.metaKey = true;
    else if (/^alt$/i.test(mod)) modifiers.altKey = true;
    else if (/^(ctrl|control)$/i.test(mod)) modifiers.ctrlKey = true;
    else if (/^shift$/i.test(mod)) modifiers.shiftKey = true;
    else if (/^mod$/i.test(mod)) {
      if (platform === 'mac') modifiers.metaKey = true;
      else modifiers.ctrlKey = true;
    } else throw new Error('Unrecognized modifier name: ' + mod);
  }

  return {
    key: result,
    modifiers,
  };
}

export function normalizeKeyName(name: string, platform: PlatformName): string {
  const parsed = parseKeyName(name, platform);

  let result = parsed.key;

  if (parsed.modifiers.altKey) result = 'Alt-' + result;
  if (parsed.modifiers.ctrlKey) result = 'Ctrl-' + result;
  if (parsed.modifiers.metaKey) result = 'Meta-' + result;
  if (parsed.modifiers.shiftKey) result = 'Shift-' + result;

  return result;
}

const modifierDisplayName: Record<keyof KeyModifiers, string> = {
  altKey: 'Alt',
  ctrlKey: 'Ctrl',
  metaKey: '⊞',
  shiftKey: 'Shift',
};

const macModiferDisplayName: Record<keyof KeyModifiers, string> = {
  altKey: '⌥',
  ctrlKey: '^',
  metaKey: '⌘',
  shiftKey: '⇧',
};

function getModifierDisplayName(
  name: keyof KeyModifiers,
  platform: PlatformName,
) {
  return platform === 'mac'
    ? macModiferDisplayName[name]
    : modifierDisplayName[name];
}

export function getShortcutDisplayParts(
  name: string,
  platform: PlatformName,
): {
  separator?: string;
  keys: string[];
} {
  const { key, modifiers } = parseKeyName(name, platform);

  return {
    separator: platform === 'mac' ? undefined : '-',
    keys: [
      modifiers.altKey && getModifierDisplayName('altKey', platform),
      modifiers.ctrlKey && getModifierDisplayName('ctrlKey', platform),
      modifiers.shiftKey && getModifierDisplayName('shiftKey', platform),
      modifiers.metaKey && getModifierDisplayName('metaKey', platform),
      key.toUpperCase(),
    ].filter((x): x is string => !!x),
  };
}

export interface KeyModifiers {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export function prependModifiers(
  name: string,
  event: KeyModifiers,
  useShift: boolean,
) {
  if (event.altKey) name = 'Alt-' + name;
  if (event.ctrlKey) name = 'Ctrl-' + name;
  if (event.metaKey) name = 'Meta-' + name;
  if (useShift !== false && event.shiftKey) name = 'Shift-' + name;
  return name;
}
