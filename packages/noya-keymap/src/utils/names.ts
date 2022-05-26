import type { PlatformName, KeyModifiers } from '../types';

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

export function parseKeyName(
  name: string,
  platform: PlatformName,
): { key: string; modifiers: KeyModifiers } {
  const parts = name.split(/-(?!$)/);

  let result = parts[parts.length - 1];

  if (result === 'Space') result = ' ';

  let alt = false;
  let ctrl = false;
  let shift = false;
  let meta = false;

  for (let i = 0; i < parts.length - 1; ++i) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
    else if (/^a(lt)?$/i.test(mod)) alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
    else if (/^s(hift)?$/i.test(mod)) shift = true;
    else if (/^mod$/i.test(mod)) {
      if (platform === 'macos' || platform === 'ios') meta = true;
      else ctrl = true;
    } else throw new Error('Unrecognized modifier name: ' + mod);
  }

  return {
    key: result,
    modifiers: {
      altKey: alt,
      ctrlKey: ctrl,
      shiftKey: shift,
      metaKey: meta,
    },
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

function getModifierDisplayName(
  name: keyof KeyModifiers,
  platform: PlatformName,
) {
  return platform === 'macos' || platform === 'ios'
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
    separator: platform === 'macos' || platform === 'ios' ? undefined : '-',
    keys: [
      modifiers.altKey && getModifierDisplayName('altKey', platform),
      modifiers.ctrlKey && getModifierDisplayName('ctrlKey', platform),
      modifiers.shiftKey && getModifierDisplayName('shiftKey', platform),
      modifiers.metaKey && getModifierDisplayName('metaKey', platform),
      key.toUpperCase(),
    ].filter((x): x is string => !!x),
  };
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
