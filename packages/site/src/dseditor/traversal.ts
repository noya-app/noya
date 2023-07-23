import cloneDeep from 'lodash/cloneDeep';
import { uuid } from 'noya-utils';
import { withOptions } from 'tree-visit';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  linkSymbolId,
} from '../ayon/symbols/symbolIds';
import {
  NoyaComponent,
  NoyaElement,
  NoyaNode,
  NoyaResolvedElement,
  NoyaResolvedNode,
} from './types';

export const elements: NoyaElement[] = [
  {
    type: 'noyaPrimitiveElement',
    name: 'Avatar',
    classNames: [],
    componentID: avatarSymbolId,
    id: uuid(),
    children: [
      {
        type: 'noyaString',
        id: uuid(),
        value: 'Devin Abbott',
      },
    ],
  },
  {
    type: 'noyaPrimitiveElement',
    name: 'Button',
    classNames: [],
    componentID: buttonSymbolId,
    id: uuid(),
    children: [
      {
        type: 'noyaString',
        id: uuid(),
        value: 'Submit',
      },
    ],
  },
  {
    type: 'noyaCompositeElement',
    name: 'Hero',
    componentID: heroSymbolId,
    id: uuid(),
  },
  {
    type: 'noyaCompositeElement',
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
    id: uuid(),
  },
];

export const initialComponents: NoyaComponent[] = [
  {
    name: 'Hero',
    type: 'noyaComponent',
    id: uuid(),
    componentID: heroSymbolId,
    rootElement: {
      name: 'Box',
      type: 'noyaPrimitiveElement',
      classNames: ['flex', 'items-center', 'gap-4'],
      componentID: boxSymbolId,
      id: 'a',
      children: [
        {
          name: 'Button',
          type: 'noyaPrimitiveElement',
          classNames: [],
          componentID: buttonSymbolId,
          id: uuid(),
          children: [
            {
              type: 'noyaString',
              id: uuid(),
              value: 'Get Started',
            },
          ],
        },
        {
          name: 'Link',
          type: 'noyaPrimitiveElement',
          classNames: [],
          componentID: linkSymbolId,
          id: uuid(),
          children: [
            {
              type: 'noyaString',
              id: uuid(),
              value: 'Learn More',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Hero with Image',
    type: 'noyaComponent',
    id: uuid(),
    componentID: heroWithImageSymbolId,
    rootElement: {
      name: 'Hero (i)',
      type: 'noyaCompositeElement',
      componentID: heroSymbolId,
      id: uuid(),
    },
    diff: {
      operations: [
        {
          path: ['a'],
          type: 'setParameters',
          value: ['flex', 'flex-col'],
        },
      ],
    },
  },
];

// const CompositeElementHierarchy = withOptions<NoyaNode>({
//   getChildren: (node) => {
//     if (
//       node.type === 'noyaString' ||
//       node.type === 'noyaCompositeElement'
//     ) {
//       return [];
//     }

//     return node.children;
//   },
// });

export const ResolvedElementHierarchy = withOptions<NoyaResolvedNode>({
  getChildren: (node) => {
    if (!node) return [];

    if (node.type === 'noyaString') {
      return [];
    }

    return node.children;
  },
});

export function getIdPath(resolved: NoyaResolvedNode, indexPath: number[]) {
  const idPath = ResolvedElementHierarchy.accessPath(resolved, indexPath)
    .map((el) => el?.id ?? '-')
    .join('/');

  return idPath;
}

export function resolveComponentHierarchy(
  getCompositeComponent: (id: string) => NoyaComponent | undefined,
  node: NoyaNode,
): NoyaResolvedNode {
  if (node.type === 'noyaString') return node;

  if (node.type === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaResolvedNode>((child) =>
      resolveComponentHierarchy(getCompositeComponent, child),
    );

    return {
      ...node,
      children,
    };
  }

  if (node.type === 'noyaCompositeElement') {
    const component = getCompositeComponent(node.componentID);

    if (!component) {
      throw new Error(
        `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
      );
    }

    const resolvedNode = resolveComponentHierarchy(
      getCompositeComponent,
      component.rootElement,
    );

    const diff = component.diff;

    if (!diff) return resolvedNode;

    return ResolvedElementHierarchy.map(
      cloneDeep(resolvedNode),
      (node, transformedChildren, indexPath) => {
        if (node?.type !== 'noyaPrimitiveElement') return node;

        const idPath = getIdPath(resolvedNode, indexPath);

        const newNode: NoyaResolvedElement = {
          ...node,
          children: transformedChildren,
        };

        diff.operations
          .filter((op) => op.path.join('/') === idPath)
          .forEach((operation) => {
            if (operation.type === 'setParameters') {
              newNode.classNames = operation.value;
            }
          });

        return newNode;
      },
    );
  }

  return null;
}
