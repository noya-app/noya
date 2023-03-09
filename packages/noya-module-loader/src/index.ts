import { DesignSystemDefinition } from '@noya-design-system/protocol';

function evaluateModule(content: string) {
  const exports = {};
  const module = { exports };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  new Function('exports', 'module', `{\n${content};\n}`)(exports, module);

  return module.exports;
}

export async function loadModule(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return evaluateModule(text);
}

export async function loadDesignSystem(name: string) {
  const exports = await loadModule(
    `https://www.unpkg.com/@noya-design-system/${name}`,
  );

  if (!(exports as any).DesignSystem) {
    throw new Error('No DesignSystem exported');
  }

  return (exports as any).DesignSystem as DesignSystemDefinition;
}
