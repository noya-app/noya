import { LayoutHierarchy, LayoutNode } from 'noya-compiler';
import { partition } from 'noya-utils';
import { hasClassGroup } from '../ayon/tailwind/tailwind';

/**
 * For each parent, if it has an image child, move all of the image's children
 * into the parent directly after the image.
 */
export function rewriteImagesWithChildren(layout: LayoutNode): LayoutNode {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') return node;

      return {
        ...node,
        children: transformedChildren.flatMap((child, index) => {
          if (typeof child === 'string') return child;

          if (child.tag === 'Image') {
            const newImage = {
              ...child,
              children: [],
            };

            return [newImage, ...child.children];
          }

          return child;
        }),
      };
    },
  ) as LayoutNode;
}

function parseClasses(classes: string | undefined) {
  return classes?.split(/\s+/) ?? [];
}

const tailwindClassMapping: Record<string, string> = {
  'text-5xl': 'variant-h1',
  'text-4xl': 'variant-h2',
  'text-3xl': 'variant-h3',
  'text-2xl': 'variant-h4',
  'text-xl': 'variant-h5',
  'text-lg': 'variant-h6',
  grow: 'flex-1',
  'flex-column': 'flex-col',
  'flex-column-reverse': 'flex-col-reverse',
  gap: 'gap-2',
};

function rewriteClasses(
  layout: LayoutNode,
  f: (
    node: LayoutNode | string,
    indexPath: number[],
    classes: string[],
  ) => string[] | void,
): LayoutNode {
  LayoutHierarchy.visit(layout, (node, indexPath) => {
    if (typeof node === 'string') return;

    let classes = parseClasses(node.attributes.class);

    classes = f(node, indexPath, classes) ?? classes;

    if (classes.length > 0) {
      node.attributes.class = classes.join(' ');
    } else {
      delete node.attributes.class;
    }
  });

  return layout;
}

export function rewriteTailwindClasses(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    return classes.map(
      (name) =>
        tailwindClassMapping[name] ||
        name.replace(/(?:space|gap)-(?:x|y)-(\d+)/, (_, n) => `gap-${n}`),
    );
  });
}

export function rewriteRootClasses(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (indexPath.length === 0) {
      if (!classes.includes('flex-1')) {
        classes.push('flex-1');
      }
    }
  });
}

const flexClasses = new Set([
  'flex-row',
  'flex-row-reverse',
  'flex-col',
  'flex-col-reverse',
  'items-start',
  'items-center',
  'items-end',
  'items-stretch',
  'justify-start',
  'justify-center',
  'justify-end',
  'justify-between',
  'justify-around',
]);

export function rewriteInferFlex(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (classes.some((name) => flexClasses.has(name))) {
      if (!classes.includes('flex')) {
        classes.unshift('flex');
      }
    }
  });
}

export function rewritePositionedParent(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') return node;

      const hasAbsoluteChild = transformedChildren.some(
        (child) =>
          typeof child !== 'string' &&
          child.attributes.class?.includes('absolute'),
      );

      const classes = parseClasses(node.attributes.class);
      const hasPositionClass = hasClassGroup('position', classes);

      return {
        ...node,
        children: transformedChildren,
        attributes: {
          ...node.attributes,
          ...(hasAbsoluteChild &&
            !hasPositionClass && {
              class: [node.attributes.class, 'relative']
                .filter(Boolean)
                .join(' '),
            }),
        },
      };
    },
  ) as LayoutNode;
}

function isAbsoluteFill(classes: string[]) {
  const isFull =
    classes.includes('inset-0') ||
    (classes.includes('w-full') && classes.includes('h-full'));

  return classes.includes('absolute') && isFull;
}

/**
 * For each node, move any absolute fill children to the beginning of the children array.
 * Then, ensure each non-absolute-fill child has a position class.
 */
export function rewriteAbsoluteFill(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') return node;

      let [absoluteFillChildren, otherChildren] = partition(
        transformedChildren,
        (child) =>
          typeof child !== 'string' &&
          isAbsoluteFill(parseClasses(child.attributes.class)),
      );

      if (absoluteFillChildren.length > 0) {
        // Ensure the other children have a position class
        otherChildren = otherChildren.map((child) => {
          if (typeof child === 'string') return child;

          const classes = parseClasses(child.attributes.class);

          if (!hasClassGroup('position', classes)) {
            classes.unshift('relative');
          }

          return {
            ...child,
            attributes: {
              ...child.attributes,
              class: classes.join(' '),
            },
          };
        });

        transformedChildren = [...absoluteFillChildren, ...otherChildren];
      }

      return {
        ...node,
        children: transformedChildren,
      };
    },
  ) as LayoutNode;
}

export function rewriteLayout(layout: LayoutNode) {
  layout = rewriteImagesWithChildren(layout);
  layout = rewriteTailwindClasses(layout);
  layout = rewriteInferFlex(layout);
  layout = rewriteAbsoluteFill(layout);
  layout = rewritePositionedParent(layout);
  layout = rewriteRootClasses(layout);
  return layout;
}
