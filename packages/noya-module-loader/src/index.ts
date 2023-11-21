import fetch from 'cross-fetch';

import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { ThumbnailDesignSystem } from './ThumbnailDesignSystem';
import { DesignSystemCache } from './cache';

const requireModule = () => {};

function evaluateModule(content: string, Function: FunctionConstructor) {
  const exports = {};
  const module = { exports };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('exports', 'module', 'require', `{\n${content};\n}`)(
    exports,
    module,
    requireModule,
  );

  return module.exports;
}

export async function loadModule(url: string, Function = window.Function) {
  const response = await fetch(url);
  const text = await response.text();
  return evaluateModule(text, Function);
}

export async function loadDesignSystem(
  name: string,
  options: {
    Function?: typeof window.Function;
    enableCache?: boolean;
  } = {},
): Promise<DesignSystemDefinition> {
  if (name === 'thumbnail') return ThumbnailDesignSystem;

  const { Function = window.Function, enableCache = true } = options;

  if (enableCache && DesignSystemCache.has(name)) {
    return DesignSystemCache.get(name)!;
  }

  const url = name.includes('@')
    ? `https://www.unpkg.com/${name}/dist/standalone`
    : `https://www.unpkg.com/@noya-design-system/${name}/dist/standalone`;

  const exports = await loadModule(url, Function);

  if (!(exports as any).DesignSystem) {
    throw new Error('No DesignSystem exported');
  }

  const designSystem = (exports as any).DesignSystem as DesignSystemDefinition;

  // Tag with id
  for (let [key, value] of Object.entries(designSystem.components)) {
    Object.assign(value, { __id: key });
  }

  if (enableCache) {
    DesignSystemCache.set(name, designSystem);
  }

  return designSystem;
}

export { DesignSystemCache, ThumbnailDesignSystem };
