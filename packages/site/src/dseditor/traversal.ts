import cloneDeep from 'lodash/cloneDeep';
import { uuid } from 'noya-utils';
import { withOptions } from 'tree-visit';
import {
  boxSymbolId,
  buttonSymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  linkSymbolId,
  tagSymbolId,
  textSymbolId,
} from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import {
  NoyaComponent,
  NoyaNode,
  NoyaResolvedElement,
  NoyaResolvedNode,
} from './types';

export const PRIMITIVE_ELEMENT_NAMES = {
  [boxSymbolId]: 'Box',
  [buttonSymbolId]: 'Button',
  [linkSymbolId]: 'Link',
  [textSymbolId]: 'Text',
  [tagSymbolId]: 'Tag',
};

const sidebarItemSymbolId = uuid();

export const initialComponents: NoyaComponent[] = [
  Model.component({
    name: 'Sidebar Item',
    componentID: sidebarItemSymbolId,
    rootElement: Model.primitiveElement({
      id: 'b',
      componentID: buttonSymbolId,
      children: [Model.string('Home')],
      classNames: ['text-left', 'justify-start', 'variant-text'],
    }),
    diff: {
      operations: [
        {
          path: ['b'],
          type: 'addParameters',
          value: ['bg-red-500'],
        },
      ],
    },
  }),
  Model.component({
    name: 'Sidebar',
    componentID: uuid(),
    rootElement: Model.primitiveElement({
      id: 'sidebar',
      componentID: boxSymbolId,
      classNames: ['flex-1', 'flex', 'flex-col', 'gap-4', 'bg-white', 'p-4'],
      children: [
        Model.compositeElement({
          id: '1',
          componentID: sidebarItemSymbolId,
        }),
        Model.compositeElement({
          componentID: sidebarItemSymbolId,
        }),
        Model.compositeElement({
          componentID: sidebarItemSymbolId,
        }),
        Model.compositeElement({
          componentID: sidebarItemSymbolId,
        }),
      ],
    }),
    diff: {
      operations: [
        {
          path: ['sidebar', 'b'],
          type: 'removeParameters',
          value: ['variant-text'],
        },
      ],
    },
  }),
  Model.component({
    name: 'Hero',
    componentID: heroSymbolId,
    rootElement: Model.primitiveElement({
      id: 'box',
      name: 'Content',
      classNames: ['flex', 'flex-col', 'items-center', 'gap-4'],
      componentID: boxSymbolId,
      children: [
        Model.primitiveElement({
          componentID: tagSymbolId,
          children: [Model.string('New')],
        }),
        Model.primitiveElement({
          name: 'Title',
          componentID: textSymbolId,
          children: [Model.string('Create, iterate, inspire.')],
          classNames: ['text-4xl', 'font-bold'],
        }),
        Model.primitiveElement({
          id: 'a',
          name: 'Actions Row',
          classNames: ['flex', 'items-center', 'gap-4'],
          componentID: boxSymbolId,
          children: [
            Model.primitiveElement({
              componentID: buttonSymbolId,
              children: [Model.string('Get Started')],
            }),
            Model.primitiveElement({
              componentID: linkSymbolId,
              children: [Model.string('Learn More')],
            }),
          ],
        }),
      ],
    }),
  }),
  Model.component({
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
    rootElement: Model.primitiveElement({
      id: 'root',
      name: 'Root',
      componentID: boxSymbolId,
      classNames: ['flex-1', 'grid', 'grid-flow-col', 'auto-cols-fr'],
      children: [
        Model.compositeElement(heroSymbolId),
        Model.primitiveElement({
          name: 'Image',
          componentID: boxSymbolId,
          classNames: ['w-96', 'h-96', 'bg-gray-200'],
        }),
      ],
    }),
    diff: {
      operations: [
        {
          path: ['root', 'box'],
          type: 'removeParameters',
          value: ['items-start'],
        },
        {
          path: ['root', 'box', 'a'],
          type: 'addParameters',
          value: ['flex-col'],
        },
        {
          path: ['root', 'box', 'a'],
          type: 'removeParameters',
          value: ['items-center'],
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

export type GetCompositeComponent = (id: string) => NoyaComponent | undefined;

export function resolveComponentHierarchy(
  getCompositeComponent: GetCompositeComponent,
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
            if (operation.type === 'addParameters') {
              newNode.classNames = [...newNode.classNames, ...operation.value];
            } else if (operation.type === 'removeParameters') {
              newNode.classNames = newNode.classNames.filter(
                (className) => !operation.value.includes(className),
              );
            }
          });

        return newNode;
      },
    );
  }

  return null;
}

export type EditableTreeItem = NoyaComponent | NoyaNode;

// export const EditableTreeHierarchy = withOptions<EditableTreeItem>({
//   getChildren(item: NoyaComponent | NoyaNode): EditableTreeItem[] {
//     switch (item.type) {
//       case 'noyaComponent':
//         return [item.rootElement];
//       case 'noyaCompositeElement': {
//         return [];
//       }
//       case 'noyaPrimitiveElement':
//         return item.children;
//       case 'noyaString':
//         return [];
//     }
//   },
// });

export function createEditableTree(
  getCompositeComponent: GetCompositeComponent,
) {
  // function resolveCompositeElement(
  //   node: NoyaCompositeElement,
  // ): NoyaResolvedElement | NoyaString {
  //   const component = getCompositeComponent(node.componentID);

  //   if (!component) {
  //     throw new Error(
  //       `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
  //     );
  //   }

  //   const resolvedNode = resolveCompositeElement(component.rootElement);

  // }

  return withOptions<EditableTreeItem>({
    getChildren(item: EditableTreeItem): EditableTreeItem[] {
      switch (item.type) {
        case 'noyaComponent': {
          const root = item.rootElement;

          if (root.type === 'noyaCompositeElement') {
            const component = getCompositeComponent(root.componentID);

            return component ? [component] : [];
          }

          return [item.rootElement];
        }
        case 'noyaCompositeElement': {
          return [getCompositeComponent(item.componentID)!];
        }
        case 'noyaPrimitiveElement': {
          return item.children.flatMap((child): EditableTreeItem[] => {
            if (child.type === 'noyaCompositeElement') {
              const component = getCompositeComponent(child.componentID);

              return component ? [component] : [];
            }

            return [child];
          });
        }
        case 'noyaString':
          return [];
      }
    },
  });
}
