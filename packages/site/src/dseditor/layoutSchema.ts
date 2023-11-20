import { ElementHierarchy, Model, NoyaNode, NoyaString } from 'noya-component';
import { partition } from 'noya-utils';
import { textSymbolId } from '../ayon/symbols/symbolIds';
import { PRIMITIVE_ELEMENT_MAP } from './primitiveElements';

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
            } else if (propSchema === 'string') {
              props = [
                ...props,
                Model.stringProp({
                  name,
                  value: '',
                }),
              ];
            } else if (propSchema === 'number') {
              props = [...props, Model.numberProp({ name, value: 50 })];
            }
          }
        },
      );

      const childrenSchema =
        typeof primitive.schema.children === 'string'
          ? { type: primitive.schema.children }
          : primitive.schema.children;

      switch (childrenSchema.type) {
        case 'none':
          transformedChildren = [];
          break;
        case 'nodes':
          transformedChildren = transformedChildren.map((node) =>
            node.type === 'noyaString'
              ? Model.primitiveElement({
                  componentID: textSymbolId,
                  children: [node],
                })
              : node,
          );
          break;
        case 'stringOrNodes': {
          const [strings, elements] = partition(
            transformedChildren,
            (node): node is NoyaString => node.type === 'noyaString',
          );
          // If there are elements, wrap each string in a text nodes
          if (elements.length > 0) {
            transformedChildren = transformedChildren.map((node) =>
              node.type === 'noyaString'
                ? Model.primitiveElement({
                    componentID: textSymbolId,
                    children: [node],
                  })
                : node,
            );
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
        case 'elementOfType': {
          const filtered = transformedChildren.filter(
            (node) =>
              (node.type === 'noyaPrimitiveElement' ||
                node.type === 'noyaCompositeElement') &&
              node.componentID === childrenSchema.componentId,
          );

          if (filtered.length !== transformedChildren.length) {
            transformedChildren = filtered;
          }
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
