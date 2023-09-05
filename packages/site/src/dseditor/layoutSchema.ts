import { partition } from 'noya-utils';
import { Model } from './builders';
import { PRIMITIVE_ELEMENT_MAP } from './primitiveElements';
import { ElementHierarchy } from './traversal';
import { NoyaNode, NoyaString } from './types';

export function enforceSchema(root: NoyaNode): NoyaNode {
  return ElementHierarchy.map(root, (node, transformedChildren) => {
    if (node.type !== 'noyaPrimitiveElement') return node;

    const primitive = PRIMITIVE_ELEMENT_MAP[node.componentID];

    if (!primitive) return node;

    let props = node.props;

    if (primitive.schema) {
      Object.entries(primitive.schema.props ?? {}).forEach(
        ([name, propSchema]) => {
          const prop = props.find((prop) => prop.name === name);

          if (!prop) {
            if (propSchema === 'image') {
              props = [
                ...props,
                Model.generatorProp({
                  name,
                  generator: 'random-image',
                  query: 'landscape',
                }),
              ];
            }
          }
        },
      );

      switch (primitive.schema.children) {
        case 'none':
          transformedChildren = [];
          break;
        case 'nodes':
          transformedChildren = transformedChildren.filter(
            (node) => node.type !== 'noyaString',
          );
          break;
        case 'stringOrNodes': {
          const [strings, elements] = partition(
            transformedChildren,
            (node): node is NoyaString => node.type === 'noyaString',
          );
          // If there are elements, remove all strings
          if (elements.length > 0) {
            transformedChildren = elements;
          }
          // If multiple strings, merge them
          else if (strings.length > 1) {
            transformedChildren = [
              Model.string({
                value: strings.map((node) => node.value).join(''),
              }),
            ];
          }

          if (transformedChildren.length === 0) {
            transformedChildren = [Model.string({ value: '' })];
          }
          break;
        }
      }
    }

    return {
      ...node,
      props,
      children: transformedChildren,
    };
  });
}
