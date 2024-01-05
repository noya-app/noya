// import cloneDeep from 'lodash/cloneDeep';
import { IndexPath } from 'tree-visit';
import { Model } from './builders';
import { ResolvedHierarchy } from './resolvedHierarchy';
import { FindComponent, createResolvedNode } from './traversal';
import {
  NoyaClassName,
  NoyaProp,
  NoyaResolvedNode,
  NoyaVariantName,
} from './types';

// noop - for performance we don't clone. But if we need to check for
// mutation bugs, we can swap this out for lodash's cloneDeep
const cloneDeep = <T>(node: T): T => node;

type Action =
  | {
      type: 'setName';
      indexPath: IndexPath;
      name: string;
    }
  | {
      type: 'setTextValue';
      indexPath: IndexPath;
      textValue: string;
    }
  | {
      type: 'setComponentID';
      indexPath: IndexPath;
      componentID: string;
    }
  | {
      type: 'setProps';
      indexPath: IndexPath;
      props: NoyaProp[];
    }
  | {
      type: 'setChildren';
      indexPath: IndexPath;
      children: NoyaResolvedNode[];
    }
  | {
      type: 'addClassNames';
      indexPath: IndexPath;
      classNames: string[];
    }
  | {
      type: 'removeClassNames';
      indexPath: IndexPath;
      classNames: string[];
    }
  | {
      type: 'setClassNames';
      indexPath: IndexPath;
      classNames: NoyaClassName[];
    }
  | {
      type: 'setVariantNames';
      indexPath: IndexPath;
      variantNames: NoyaVariantName[];
    }
  | {
      type: 'insertNode';
      indexPath: IndexPath;
      node: NoyaResolvedNode;
    }
  | {
      type: 'removeNode';
      indexPath: IndexPath;
    }
  | {
      type: 'replaceNodeWithFirstChild';
      indexPath: IndexPath;
    }
  | {
      type: 'wrapNode';
      indexPath: IndexPath;
      primitiveType: string;
      findComponent: FindComponent;
    }
  | {
      type: 'duplicateNode';
      indexPath: IndexPath;
    };

export function resolvedNodeReducer(
  resolvedNode: NoyaResolvedNode,
  action: Action,
): NoyaResolvedNode {
  switch (action.type) {
    case 'setName': {
      const { indexPath, name } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          name,
        },
      });
    }
    case 'addClassNames': {
      const { indexPath, classNames: className } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          classNames: [
            ...node.classNames,
            ...className.map((c) => Model.className(c)),
          ],
        },
      });
    }
    case 'removeClassNames': {
      const { indexPath, classNames } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          classNames: node.classNames.filter(
            (c) => !classNames.includes(c.value),
          ),
        },
      });
    }
    case 'insertNode': {
      const { indexPath, node: child } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.insert(resolvedNode, {
        at: [...indexPath, node.children.length],
        nodes: [child],
      });
    }
    case 'removeNode': {
      const { indexPath } = action;

      return ResolvedHierarchy.remove(resolvedNode, {
        indexPaths: [indexPath],
      });
    }
    case 'duplicateNode': {
      const { indexPath } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      return ResolvedHierarchy.insert(resolvedNode, {
        at: [...indexPath.slice(0, -1), indexPath.at(-1)! + 1],
        nodes: [ResolvedHierarchy.clone(node)],
      });
    }
    case 'replaceNodeWithFirstChild': {
      const { indexPath } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      if (node.children.length === 0) return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: cloneDeep(node.children[0]),
      });
    }
    case 'wrapNode': {
      const { indexPath, primitiveType, findComponent } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      const wrappedNode = createResolvedNode({
        findComponent,
        node: Model.primitiveElement({
          componentID: primitiveType,
          children: [node],
        }),
      });

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: wrappedNode,
      });
    }
    case 'setTextValue': {
      const { indexPath, textValue } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaString') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          value: textValue,
        },
      });
    }
    case 'setComponentID': {
      const { indexPath, componentID } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (!node || node.type === 'noyaString') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          componentID,
        },
      });
    }
    case 'setClassNames': {
      const { indexPath, classNames } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          classNames: cloneDeep(classNames),
        },
      });
    }
    case 'setProps': {
      const { indexPath, props } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          props: cloneDeep(props),
        },
      });
    }
    case 'setVariantNames': {
      const { indexPath, variantNames } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaCompositeElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          variantNames: cloneDeep(variantNames),
        },
      });
    }
    case 'setChildren': {
      const { indexPath, children } = action;

      const node = ResolvedHierarchy.access(resolvedNode, indexPath);

      if (node?.type !== 'noyaPrimitiveElement') return resolvedNode;

      return ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: {
          ...cloneDeep(node),
          children: cloneDeep(children),
        },
      });
    }
  }
}
