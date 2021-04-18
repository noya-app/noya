import Sketch from '@sketch-hq/sketch-file-format-ts';

export type SwatchGroup = {
  name: string;
  swatches: Sketch.Swatch[];
  children: SwatchGroup[];
};

export function createSwatchTree(swatches: Sketch.Swatch[]): SwatchGroup {
  const root: SwatchGroup = {
    name: '',
    swatches: [],
    children: [],
  };

  function getGroup(pathComponents: string[]): SwatchGroup {
    let group = root;
    while (pathComponents.length > 0) {
      const component = pathComponents.shift()!;

      const existing = group.children.find((group) => group.name === component);
      if (existing) {
        group = existing;
      } else {
        const newGroup = {
          name: component,
          swatches: [],
          children: [],
        };
        group.children.push(newGroup);
        group = newGroup;
      }
    }
    return group;
  }

  swatches.forEach((swatch) => {
    const pathComponents = swatch.name.split('/');
    const parent = getGroup(pathComponents.slice(0, -1));
    parent.swatches.push(swatch);
  });
  return root;
}
