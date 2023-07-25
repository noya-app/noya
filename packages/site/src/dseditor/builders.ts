import { uuid } from 'noya-utils';
import {
  NoyaComponent,
  NoyaCompositeElement,
  NoyaPrimitiveElement,
  NoyaString,
  NoyaVariant,
} from './types';

type ModelOptions<T> = Partial<Omit<T, 'type'>>;

function noyaString(
  options: ModelOptions<NoyaString> | string = {},
): NoyaString {
  if (typeof options === 'string') {
    options = { value: options };
  }

  return {
    value: '',
    ...options,
    id: options.id ?? uuid(),
    type: 'noyaString',
  };
}

function noyaPrimitiveElement(
  options: ModelOptions<NoyaPrimitiveElement> &
    Pick<NoyaPrimitiveElement, 'componentID'>,
): NoyaPrimitiveElement {
  return {
    ...options,
    id: options.id ?? uuid(),
    componentID: options.componentID,
    classNames: options.classNames ?? [],
    children: options.children ?? [],
    type: 'noyaPrimitiveElement',
  };
}

function noyaCompositeElement(
  options:
    | (ModelOptions<NoyaCompositeElement> &
        Pick<NoyaCompositeElement, 'componentID'>)
    | string,
): NoyaCompositeElement {
  if (typeof options === 'string') {
    options = { componentID: options };
  }

  return {
    ...options,
    id: options.id ?? uuid(),
    componentID: options.componentID,
    type: 'noyaCompositeElement',
  };
}

function noyaComponent(
  options: ModelOptions<NoyaComponent> &
    Pick<NoyaComponent, 'componentID' | 'rootElement'>,
): NoyaComponent {
  return {
    ...options,
    id: options.id ?? uuid(),
    componentID: options.componentID,
    type: 'noyaComponent',
    name: options.name ?? '',
  };
}

function noyaVariant(options: ModelOptions<NoyaVariant>) {
  return {
    diff: { operations: [] },
    ...options,
    id: options.id ?? uuid(),
  };
}

export namespace Model {
  export const string = noyaString;
  export const primitiveElement = noyaPrimitiveElement;
  export const compositeElement = noyaCompositeElement;
  export const component = noyaComponent;
  export const variant = noyaVariant;
}
