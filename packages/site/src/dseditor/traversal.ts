import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  linkSymbolId,
} from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import {
  NoyaComponent,
  NoyaElement,
  NoyaNode,
  NoyaResolvedElement,
  NoyaResolvedNode,
} from './types';

export const elements: NoyaElement[] = [
  Model.primitiveElement({
    name: 'Avatar',
    componentID: avatarSymbolId,
    children: [Model.string('Devin Abbott')],
  }),
  Model.primitiveElement({
    name: 'Button',
    componentID: buttonSymbolId,
    children: [Model.string('Submit')],
  }),
  Model.compositeElement({
    name: 'Hero',
    componentID: heroSymbolId,
  }),
  Model.compositeElement({
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
  }),
];

export const initialComponents: NoyaComponent[] = [
  Model.component({
    name: 'Hero',
    componentID: heroSymbolId,
    rootElement: Model.primitiveElement({
      id: 'a',
      name: 'Box',
      classNames: ['flex', 'items-center', 'gap-4'],
      componentID: boxSymbolId,
      children: [
        Model.primitiveElement({
          name: 'Button',
          componentID: buttonSymbolId,
          children: [Model.string('Get Started')],
        }),
        Model.primitiveElement({
          name: 'Link',
          componentID: linkSymbolId,
          children: [Model.string('Learn More')],
        }),
      ],
    }),
  }),
  Model.component({
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
    rootElement: Model.compositeElement(heroSymbolId),
    diff: {
      operations: [
        {
          path: ['a'],
          type: 'setParameters',
          value: ['flex', 'flex-col'],
        },
      ],
    },
  }),
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
