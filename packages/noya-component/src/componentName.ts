import { PRIMITIVE_ELEMENT_NAMES } from './primitiveElements';
import { FindComponent } from './traversal';
import { NoyaResolvedNode } from './types';

export function getNodeName(
  node: NoyaResolvedNode,
  findComponent: FindComponent,
): string {
  switch (node.type) {
    case 'noyaString':
      return node.value;
    case 'noyaPrimitiveElement':
      return node.name ?? PRIMITIVE_ELEMENT_NAMES[node.componentID];
    case 'noyaCompositeElement': {
      if (node.name) return node.name;

      const component = findComponent(node.componentID);

      return component ? component.name : '<Component Not Found>';
    }
  }
}
export function getComponentName(
  node: NoyaResolvedNode,
  findComponent: FindComponent,
): string {
  switch (node.type) {
    case 'noyaString':
      return 'String';
    case 'noyaPrimitiveElement':
      return PRIMITIVE_ELEMENT_NAMES[node.componentID];
    case 'noyaCompositeElement': {
      const component = findComponent(node.componentID);

      if (!component) return '<Component Not Found>';

      return component.name ?? '<No Name>';
    }
  }
}
