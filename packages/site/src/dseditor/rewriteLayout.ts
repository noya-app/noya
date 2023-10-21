import { LayoutHierarchy, LayoutNode } from 'noya-compiler';
import { memoize, partition } from 'noya-utils';
import {
  ClassGroupKey,
  extractTailwindClassesByBreakpoint,
  filterTailwindClassesByLastInGroup,
  getTailwindClassGroup,
  hasClassGroup,
  isTailwindClassGroup,
} from '../ayon/tailwind/tailwind';

export function rewriteRemoveHiddenElements(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') return node;

      return {
        ...node,
        children: transformedChildren.filter(
          (child) =>
            typeof child === 'string' ||
            !parseClasses(child.attributes.class).includes('hidden'),
        ),
      };
    },
  ) as LayoutNode;
}

let domParser: DOMParser | undefined;

/**
 * Unescape HTML entities in a string. There are some unexpected behaviors when
 * converting a full string (e.g. collapsing whitespace) so we only convert
 * individual entities using this function.
 */
export const unescapeHTML = memoize(function unescapeHtml(html: string) {
  if (!domParser) domParser = new DOMParser();

  return (
    domParser.parseFromString(html, 'text/html').documentElement.textContent ??
    ''
  );
});

const entityRE = /(&[a-zA-Z]+;)|(&#\d+;)|(&#x[a-fA-F0-9]+;)/g;

export const replaceHTMLEntities = memoize(function replaceHTMLEntities(
  html: string,
) {
  return html.replace(entityRE, (match) => {
    return unescapeHTML(match);
  });
});

export function rewriteHTMLEntities(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') {
        return replaceHTMLEntities(node);
      }

      return {
        ...node,
        children: transformedChildren,
      };
    },
  ) as LayoutNode;
}

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

const hallucinatedClasses = new Set(['btn', 'btn-primary', 'lg', 'md', 'sm']);

const tailwindClassMapping: Record<string, string> = {
  'text-6xl': 'variant-h1',
  'text-5xl': 'variant-h1',
  'text-4xl': 'variant-h2',
  'text-3xl': 'variant-h3',
  'text-2xl': 'variant-h4',
  'text-xl': 'variant-h5',
  'text-lg': 'variant-h6',
  'text-md': '',
  'text-sm': '',
  'text-xs': '',
  'text-base': '',
  grow: 'flex-1',
  'flex-grow': 'grow',
  'flex-shrink': 'shrink',
  'flex-column': 'flex-col',
  'flex-column-reverse': 'flex-col-reverse',
  gap: 'gap-2',
  transition: '',
  'duration-500': '',
  fixed: '',
  'list-none': '',
  'list-disc': '',
  'list-decimal': '',
  bullet: '',
};

function rewriteClasses(
  layout: LayoutNode,
  f: (
    node: LayoutNode,
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
    classes = classes.filter(
      (name) =>
        name &&
        !hallucinatedClasses.has(name) &&
        !name.includes(':') &&
        tailwindClassMapping[name] !== '',
    );

    const hasSpaceX = classes.some((name) => /(space|gap)-x/.test(name));
    const hasSpaceY = classes.some((name) => /(space|gap)-y/.test(name));

    classes = classes.map(
      (name) =>
        tailwindClassMapping[name] ??
        name.replace(/(?:space|gap)-(?:x|y)-(\d+)/, (_, n) => `gap-${n}`),
    );

    if (hasSpaceX) {
      classes.push('flex', 'flex-row');
    } else if (hasSpaceY) {
      classes.push('flex', 'flex-col');
    }

    return classes;
  });
}

const spacingClassGroups = new Set<ClassGroupKey>([
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingX',
  'paddingY',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginX',
  'marginY',
  'gap',
]);

/**
 * Replace all spacing values (p-4, mt-8, gap-3, etc) with a value of "4"
 */
export function rewriteConsistentSpacing(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    return classes.map((name) => {
      const group = getTailwindClassGroup(name);

      if (spacingClassGroups.has(group)) {
        // Replace numeric value
        return name.replace(/(\d+)/, '4');
      }

      return name;
    });
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

const forbiddenClassGroups: Record<string, ClassGroupKey[]> = {
  button: [
    'padding',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingX',
    'paddingY',
    'borderRadius',
    'fontWeight',
    'fontSize',
    // Consider adding this back in some form when we have color scheme support
    'background',
    'textColor',
  ],
  card: [
    'padding',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingX',
    'paddingY',
    'borderRadius',
    'borderWidth',
    'borderColor',
    'boxShadow',
    'background',
  ],
  select: [
    'padding',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingX',
    'paddingY',
  ],
  tag: [
    'flex',
    'padding',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingX',
    'paddingY',
  ],
};

export function rewriteForbiddenClassGroups(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    const forbiddenGroups = forbiddenClassGroups[node.tag.toLowerCase()];

    if (forbiddenGroups) {
      classes = classes.filter((name) => {
        return !forbiddenGroups.some(
          (group) => getTailwindClassGroup(name) === group,
        );
      });
    }

    return classes;
  });
}

export function rewriteFlex1ButtonInColumn(layout: LayoutNode) {
  // eslint-disable-next-line @shopify/prefer-early-return
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (
      node.tag === 'Button' &&
      classes.includes('flex-1') &&
      indexPath.length > 0
    ) {
      const parent = LayoutHierarchy.access(layout, indexPath.slice(0, -1));

      if ((parent as LayoutNode).attributes.class?.includes('flex-col')) {
        return classes.filter((name) => name !== 'flex-1');
      }
    }
  });
}

/**
 * If a button has multiple children, apply inline-flex and gap-2 to the button.
 */
export function rewriteInlineFlexButtonAndLink(layout: LayoutNode) {
  // eslint-disable-next-line @shopify/prefer-early-return
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (
      (node.tag === 'Button' || node.tag === 'Link') &&
      node.children.length > 1 &&
      !hasClassGroup('display', classes)
    ) {
      classes.push('inline-flex');

      if (!hasClassGroup('gap', classes)) {
        classes.push('gap-2');
      }
    }
  });
}

/**
 * If an icon doesn't have a width and/or height, add a width and/or height of 24.
 */
export function rewriteIconSize(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (node.tag !== 'Icon') return;
    if (!hasClassGroup('width', classes)) {
      classes.push('w-6');
    }
    if (!hasClassGroup('height', classes)) {
      classes.push('h-6');
    }
  });
}

const iconWidthRE = /^w-(1|2|3|4|5|6)$/;
const iconHeightRE = /^h-(1|2|3|4|5|6)$/;

/**
 * Replace Image with Icon if:
 * - Image has "icon" in its name or alt
 * - Image has width and height 6 or less
 */
export function rewriteImageToIcon(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') return node;

      if (node.tag === 'Image') {
        if (
          node.attributes.alt?.match(/icon/i) ||
          node.attributes.name?.match(/icon/i)
        ) {
          return { ...node, tag: 'Icon' };
        }

        const classes = parseClasses(node.attributes.class);

        if (
          classes.some((name) => iconWidthRE.test(name)) &&
          classes.some((name) => iconHeightRE.test(name))
        ) {
          return { ...node, tag: 'Icon' };
        }
      }

      return {
        ...node,
        children: transformedChildren,
      };
    },
  ) as LayoutNode;
}

// Match: "Card", "Restaurant Card", "Card 1"
// Don't match: "Card Grid" or "Card Title"
const cardRE = /card(\s*\d)?$/i;

/**
 * Replace Box/div with Card if it has:
 * - a name that ends with "Card"
 *   (e.g. "Restaurant Card" but not "Card Title" or "Card Grid")
 * - "padding && (border || shadow)" class.
 *
 * We shouldn't do this if we're already within a Card component or if
 * we have any Card children. We convert from innermost to outermost.
 */
export function rewriteBoxToCard(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren, indexPath) => {
      if (typeof node === 'string') return node;

      if (node.tag === 'Box' || node.tag === 'div') {
        const classes = parseClasses(node.attributes.class);

        if (
          node.attributes.name?.match(cardRE) ||
          (hasClassGroup('padding', classes) &&
            (hasClassGroup('borderWidth', classes) ||
              hasClassGroup('boxShadow', classes)))
        ) {
          const ancestors = LayoutHierarchy.accessPath(
            layout,
            indexPath.slice(0, -1),
          );

          const hasCardChild = transformedChildren.some(
            (child) =>
              LayoutHierarchy.find(
                child,
                (node) => typeof node !== 'string' && node.tag === 'Card',
              ) !== undefined,
          );

          if (
            ancestors.every(
              (ancestor) => (ancestor as LayoutNode).tag !== 'Card',
            ) &&
            !hasCardChild
          ) {
            return { ...node, tag: 'Card', children: transformedChildren };
          }
        }
      }

      return {
        ...node,
        children: transformedChildren,
      };
    },
  ) as LayoutNode;
}

export function rewriteSvgToIcon(layout: LayoutNode) {
  return LayoutHierarchy.map<LayoutNode | string>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') return node;

      if (node.tag === 'svg') {
        return {
          ...node,
          attributes: {
            ...node.attributes,
            alt: node.attributes.alt ?? node.attributes.name ?? 'icon',
          },
          tag: 'Icon',
        };
      }

      return {
        ...node,
        children: transformedChildren,
      };
    },
  ) as LayoutNode;
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

function isFill(classes: string[]) {
  return (
    classes.includes('inset-0') ||
    (classes.includes('w-full') && classes.includes('h-full'))
  );
}

function isAbsoluteFill(classes: string[]) {
  return classes.includes('absolute') && isFill(classes);
}

/**
 * If a node has 'w-full h-full' or 'inset-0', make sure it also has 'absolute'.
 */
export function rewriteAlmostAbsoluteFill(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (isFill(classes) && !hasClassGroup('position', classes)) {
      classes.push('absolute');
    }
  });
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

/**
 * Add "flex-col" unless conflicting classes are present.
 * Add  "gap-4" to cards without padding/gap. The consistent spacing rewrite
 * will replace any other padding values.
 */
export function rewriteCardPadding(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    if (node.tag !== 'Card') return;

    // Always use flex as the default
    classes = classes.filter((name) => !isTailwindClassGroup(name, 'display'));

    if (!hasClassGroup('flexDirection', classes)) {
      classes.push('flex-col');
    }

    if (!hasClassGroup('gap', classes)) {
      classes.push('gap-4');
    }

    return classes;
  });
}

// Keep classNames starting with sm: and md:, but remove the prefixes.
// Remove any classNames starting with lg:, xl:, and 2xl:.
export function rewriteBreakpointClasses(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    return extractTailwindClassesByBreakpoint(classes, 'md');
  });
}

export function rewriteClassesKeepLastInGroup(layout: LayoutNode) {
  return rewriteClasses(layout, (node, indexPath, classes) => {
    return filterTailwindClassesByLastInGroup(classes);
  });
}

// export function rewriteAlwaysFlexGap(layout: LayoutNode) {
//   return rewriteClasses(layout, (node, indexPath, classes) => {
//     if (
//       !hasClassGroup('gap', classes) &&
//       (classes.includes('flex') || classes.includes('inline-flex'))
//     ) {
//       classes.push('gap-4');
//     }
//   });
// }

export function rewriteLayout(layout: LayoutNode) {
  layout = rewriteBreakpointClasses(layout);
  layout = rewriteClassesKeepLastInGroup(layout);
  layout = rewriteRemoveHiddenElements(layout);
  layout = rewriteHTMLEntities(layout);
  layout = rewriteImagesWithChildren(layout);
  layout = rewriteSvgToIcon(layout);
  layout = rewriteImageToIcon(layout);
  layout = rewriteBoxToCard(layout);
  layout = rewriteTailwindClasses(layout);
  layout = rewriteForbiddenClassGroups(layout);
  layout = rewriteFlex1ButtonInColumn(layout);
  layout = rewriteInlineFlexButtonAndLink(layout);
  layout = rewriteIconSize(layout);
  layout = rewriteCardPadding(layout);
  // layout = rewriteConsistentSpacing(layout);
  layout = rewriteInferFlex(layout);
  layout = rewriteAlmostAbsoluteFill(layout);
  layout = rewriteAbsoluteFill(layout);
  layout = rewritePositionedParent(layout);
  layout = rewriteRootClasses(layout);
  return layout;
}
