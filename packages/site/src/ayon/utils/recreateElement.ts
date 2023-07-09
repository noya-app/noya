import { DesignSystemDefinition } from '@noya-design-system/protocol';
import React from 'react';

function isDesignSystemComponent(type: React.ReactNode): type is React.FC & {
  __id: string;
} {
  return typeof type === 'function' && type !== null && '__id' in type;
}

export function recreateElement(
  designSystem: Pick<DesignSystemDefinition, 'createElement' | 'components'>,
  element: React.ReactNode,
): React.ReactNode {
  if (
    element === null ||
    element === undefined ||
    typeof element === 'string'
  ) {
    return element;
  }

  if (Array.isArray(element)) {
    return element.map((child) => recreateElement(designSystem, child));
  }

  if (!React.isValidElement(element)) {
    throw new Error(`Invalid element: ${element}`);
  }

  const { type, props } = element;

  if (typeof type === 'string') {
    const clonedProps = { ...props };

    if (props.children) {
      clonedProps.children = recreateElement(designSystem, props.children);
    }

    return designSystem.createElement(type, clonedProps);
  }

  if (isDesignSystemComponent(type)) {
    const clonedProps = { ...props };

    if (props.children) {
      clonedProps.children = recreateElement(designSystem, props.children);
    }

    const DesignSystemComponent = designSystem.components[type.__id];

    if (!DesignSystemComponent) {
      console.warn(`Cannot find component: ${type.__id}`);

      return null;
    }

    const result = designSystem.createElement(
      DesignSystemComponent,
      clonedProps,
    );

    return result;
  }

  const nested = (type as any)(props);

  return recreateElement(designSystem, nested);
}
