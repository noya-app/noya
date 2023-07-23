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
    _class: 'noyaPrimitiveElement',
    name: 'Avatar',
    classNames: [],
    componentID: avatarSymbolId,
    do_objectID: uuid(),
    children: [
      {
        _class: 'noyaString',
        do_objectID: uuid(),
        value: 'Devin Abbott',
      },
    ],
  },
  {
    _class: 'noyaPrimitiveElement',
    name: 'Button',
    classNames: [],
    componentID: buttonSymbolId,
    do_objectID: uuid(),
    children: [
      {
        _class: 'noyaString',
        do_objectID: uuid(),
        value: 'Submit',
      },
    ],
  },
  {
    _class: 'noyaCompositeElement',
    name: 'Hero',
    componentID: heroSymbolId,
    do_objectID: uuid(),
  },
  {
    _class: 'noyaCompositeElement',
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
    do_objectID: uuid(),
  },
];

export const components: NoyaComponent[] = [
  {
    name: 'Hero',
    _class: 'noyaComponent',
    do_objectID: uuid(),
    componentID: heroSymbolId,
    rootElement: {
      name: 'Box',
      _class: 'noyaPrimitiveElement',
      classNames: ['flex', 'items-center', 'gap-4'],
      componentID: boxSymbolId,
      do_objectID: 'a',
      children: [
        {
          name: 'Button',
          _class: 'noyaPrimitiveElement',
          classNames: [],
          componentID: buttonSymbolId,
          do_objectID: uuid(),
          children: [
            {
              _class: 'noyaString',
              do_objectID: uuid(),
              value: 'Get Started',
            },
          ],
        },
        {
          name: 'Link',
          _class: 'noyaPrimitiveElement',
          classNames: [],
          componentID: linkSymbolId,
          do_objectID: uuid(),
          children: [
            {
              _class: 'noyaString',
              do_objectID: uuid(),
              value: 'Learn More',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Hero with Image',
    _class: 'noyaComponent',
    do_objectID: uuid(),
    componentID: heroWithImageSymbolId,
    rootElement: {
      name: 'Hero (i)',
      _class: 'noyaCompositeElement',
      componentID: heroSymbolId,
      do_objectID: uuid(),
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
//       node._class === 'noyaString' ||
//       node._class === 'noyaCompositeElement'
//     ) {
//       return [];
//     }

//     return node.children;
//   },
// });

export const ResolvedElementHierarchy = withOptions<NoyaResolvedNode>({
  getChildren: (node) => {
    if (!node) return [];

    if (node._class === 'noyaString') {
      return [];
    }

    return node.children;
  },
});

export function getIdPath(resolved: NoyaResolvedNode, indexPath: number[]) {
  const idPath = ResolvedElementHierarchy.accessPath(resolved, indexPath)
    .map((el) => el?.do_objectID ?? '-')
    .join('/');

  return idPath;
}

export function resolveComponentHierarchy(
  getCompositeComponent: (id: string) => NoyaComponent | undefined,
  node: NoyaNode,
): NoyaResolvedNode {
  if (node._class === 'noyaString') return node;

  if (node._class === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaResolvedNode>((child) =>
      resolveComponentHierarchy(getCompositeComponent, child),
    );

    return {
      ...node,
      children,
    };
  }

  if (node._class === 'noyaCompositeElement') {
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
        if (node?._class !== 'noyaPrimitiveElement') return node;

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
