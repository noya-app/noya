import { uuid } from '@noya-app/noya-utils';
import {
  NoyaClassName,
  NoyaComponent,
  NoyaCompositeElement,
  NoyaDiff,
  NoyaDiffItem,
  NoyaGeneratorProp,
  NoyaNumberProp,
  NoyaPrimitiveElement,
  NoyaProp,
  NoyaString,
  NoyaStringProp,
  NoyaVariant,
  NoyaVariantName,
} from 'noya-component';

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
  options:
    | string
    | (ModelOptions<NoyaPrimitiveElement> &
        Pick<NoyaPrimitiveElement, 'componentID'>),
): NoyaPrimitiveElement {
  if (typeof options === 'string') {
    options = { componentID: options };
  }

  return {
    ...options,
    id: options.id ?? uuid(),
    componentID: options.componentID,
    classNames: options.classNames ?? [],
    props: options.props ?? [],
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

function noyaVariant(options: ModelOptions<NoyaVariant>): NoyaVariant {
  return {
    diff: { items: [] },
    ...options,
    id: options.id ?? uuid(),
  };
}

function noyaDiffItem(
  options: ModelOptions<NoyaDiffItem> & Pick<NoyaDiffItem, 'path'>,
): NoyaDiffItem {
  return {
    ...options,
    path: options.path,
    id: options.id ?? uuid(),
  };
}

function noyaDiff(options: ModelOptions<NoyaDiff> | NoyaDiff['items'] = {}) {
  if (Array.isArray(options)) {
    options = { items: options };
  }

  return {
    ...options,
    items: options.items ?? [],
  };
}

function noyaClassName(
  options:
    | (ModelOptions<NoyaClassName> & Pick<NoyaClassName, 'value'>)
    | string,
): NoyaClassName {
  if (typeof options === 'string') {
    options = { value: options };
  }

  return {
    ...options,
    id: options.id ?? uuid(),
  };
}

function noyaVariantName(
  options:
    | (ModelOptions<NoyaVariantName> & Pick<NoyaVariantName, 'variantID'>)
    | string,
): NoyaVariantName {
  if (typeof options === 'string') {
    options = { variantID: options };
  }

  return {
    ...options,
    id: options.id ?? uuid(),
  };
}

function noyaClassNames(
  options: Parameters<typeof noyaClassName>[0][],
): NoyaClassName[] {
  return options.map(noyaClassName);
}

function noyaStringProp(
  options: ModelOptions<NoyaProp> & Pick<NoyaStringProp, 'name' | 'value'>,
): NoyaProp {
  return {
    ...options,
    id: options.id ?? uuid(),
    type: 'string',
  };
}

function noyaNumberProp(
  options: ModelOptions<NoyaNumberProp> &
    Pick<NoyaNumberProp, 'name' | 'value'>,
): NoyaNumberProp {
  return {
    ...options,
    id: options.id ?? uuid(),
    type: 'number',
  };
}

function noyaGeneratorProp(
  options: ModelOptions<NoyaProp> &
    Pick<NoyaGeneratorProp, 'name' | 'query' | 'generator'>,
): NoyaProp {
  return {
    ...options,
    id: options.id ?? uuid(),
    type: 'generator',
  };
}

export namespace Model {
  export const string = noyaString;
  export const primitiveElement = noyaPrimitiveElement;
  export const compositeElement = noyaCompositeElement;
  export const component = noyaComponent;
  export const variant = noyaVariant;
  export const diffItem = noyaDiffItem;
  export const diff = noyaDiff;
  export const variantName = noyaVariantName;
  export const className = noyaClassName;
  export const classNames = noyaClassNames;
  export const stringProp = noyaStringProp;
  export const numberProp = noyaNumberProp;
  export const generatorProp = noyaGeneratorProp;
}
