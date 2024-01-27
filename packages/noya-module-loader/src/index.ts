import { DesignSystemDefinition } from '@noya-design-system/protocol';
import fetch from 'cross-fetch';
import { getKeyValueStore } from 'simple-kvs';
import { ThumbnailDesignSystem } from './ThumbnailDesignSystem';
import { VanillaDesignSystem } from './VanillaDesignSystem';
import { DesignSystemCache } from './cache';

const requireModule = () => {};

function evaluateModule(content: string, Function: FunctionConstructor) {
  const exports = {};
  const module = { exports };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('exports', 'module', 'require', 'process', `{\n${content};\n}`)(
    exports,
    module,
    requireModule,
    process,
  );

  return module.exports;
}

async function fetchModule(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

const UnpkgCache = {
  getValue: async (key: string) => {
    try {
      const store = await getKeyValueStore('unpkg');
      return await store.get<string>(key);
    } catch (error) {
      // ignore indexdb errors
    }
  },
  setValue: async (key: string, value: string) => {
    try {
      const store = await getKeyValueStore('unpkg');
      await store.set(key, value);
    } catch (error) {
      // ignore indexdb errors
    }
  },
};

export async function loadDesignSystem(
  name: string,
  version: string,
  options: {
    Function?: typeof window.Function;
    enableCache?: boolean;
    useLocal?: boolean;
  } = {},
): Promise<DesignSystemDefinition> {
  if (name === 'thumbnail') return ThumbnailDesignSystem;
  if (name === 'vanilla') return VanillaDesignSystem;

  const { Function = window.Function, enableCache = true } = options;

  const key = `${name}@${version}`;

  if (enableCache && DesignSystemCache.has(key)) {
    return DesignSystemCache.get(key)!;
  }

  const url = options.useLocal
    ? `http://localhost:8080/${name.replace(
        '@noya-design-system/',
        '',
      )}/standalone.js`
    : name.includes('@')
    ? `https://www.unpkg.com/${key}/dist/standalone`
    : `https://www.unpkg.com/@noya-design-system/${key}/dist/standalone`;

  let source = await UnpkgCache.getValue(url);

  if (source === undefined) {
    source = await fetchModule(url);

    if (version !== 'latest') {
      UnpkgCache.setValue(url, source);
    }
  }

  const exports = evaluateModule(source, Function);

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
