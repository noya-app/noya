import fetch from 'cross-fetch';

import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DesignSystemCache } from './cache';

const requireModule = () => {};

function evaluateModule(content: string) {
  const exports = {};
  const module = { exports };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  new Function('exports', 'module', 'require', `{\n${content};\n}`)(
    exports,
    module,
    requireModule,
  );

  return module.exports;
}

export async function loadModule(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return evaluateModule(text);
}

export async function loadDesignSystem(name: string) {
  if (DesignSystemCache.has(name)) {
    return DesignSystemCache.get(name)!;
  }

  const exports = await loadModule(
    `https://www.unpkg.com/@noya-design-system/${name}/dist/standalone.js`,
  );

  if (!(exports as any).DesignSystem) {
    throw new Error('No DesignSystem exported');
  }

  const designSystem = (exports as any).DesignSystem as DesignSystemDefinition;

  // Tag with id
  for (let [key, value] of Object.entries(designSystem.components)) {
    Object.assign(value, { __id: key });
  }

  DesignSystemCache.set(name, designSystem);

  return designSystem;
}

export { DesignSystemCache };
