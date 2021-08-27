import { hostApp } from './hostApp';

export * from './applicationMenu';
export * from './fileManager';
export * from './types';

export function doubleClickToolbar() {
  hostApp.sendMessage({ type: 'doubleClickToolbar' });
}
