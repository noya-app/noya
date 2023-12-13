import { ArrayDiffItem } from './arrayDiff';

export type NoyaString = {
  id: string;
  type: 'noyaString';
  name?: string;
  value: string;
};

type NoyaElementBase = {
  id: string;
  componentID: string;
  name?: string;
};

/**
 * Corresponds to a React host element like 'div'. In our case these elements
 * come from the design system, e.g. a Chakra UI Button.
 */
export type NoyaPrimitiveElement = NoyaElementBase & {
  type: 'noyaPrimitiveElement';
  // Props
  classNames: NoyaClassName[];
  props: NoyaProp[];
  children: NoyaNode[];
};

/**
 * Corresponds to a React composite element (i.e. a component instance).
 * Unlike React components which must expose props, the entire component hierarchy
 * can be configured.
 */
export type NoyaCompositeElement = NoyaElementBase & {
  type: 'noyaCompositeElement';
  // Props
  diff?: NoyaDiff;
  variantNames?: NoyaVariantName[];
};

export type NoyaNode = NoyaElement | NoyaString;
export type NoyaElement = NoyaPrimitiveElement | NoyaCompositeElement;

/**
 * When editing or rendering the tree, we want to use the tree with diffs applied.
 */
export type NoyaResolvedNode =
  | NoyaResolvedPrimitiveElement
  | NoyaResolvedCompositeElement
  | NoyaResolvedString;
export type NoyaResolvedCompositeElement = NoyaCompositeElement & {
  rootElement: NoyaResolvedNode;
  path: string[];
};
export type NoyaResolvedPrimitiveElement = Omit<
  NoyaPrimitiveElement,
  'children'
> & {
  children: NoyaResolvedNode[];
  path: string[];
};
export type NoyaResolvedString = NoyaString & {
  path: string[];
};
export type NoyaClassName = {
  id: string;
  value: string;
};
export type NoyaVariantName = {
  id: string;
  variantID: string;
};
export type NoyaStringProp = {
  type: 'string';
  id: string;
  name: string;
  value: string;
};
export type NoyaNumberProp = {
  type: 'number';
  id: string;
  name: string;
  value: number;
};
export type NoyaGeneratorProp = {
  type: 'generator';
  id: string;
  generator: 'random-image' | 'random-icon' | 'geometric';
  name: string;
  query: string;
  result?: string;
  resolvedQuery?: string;
  data?: any;
};
export type NoyaProp = NoyaStringProp | NoyaNumberProp | NoyaGeneratorProp;

export type NoyaDiffItem = {
  path: string[];
  props?: ArrayDiffItem<NoyaProp>[];
  classNames?: ArrayDiffItem<NoyaClassName>[];
  variantNames?: ArrayDiffItem<NoyaVariantName>[];
  children?: ArrayDiffItem<NoyaNode>[];
  textValue?: string;
  name?: string;
  componentID?: string;
};

export type NoyaDiff = {
  items: NoyaDiffItem[];
};

export type NoyaVariant = {
  id: string;
  name?: string;
  diff: NoyaDiff;
};

export type ComponentThumbnailPosition = 'top' | 'center' | 'bottom';

export type ComponentThumbnailChrome = 'window' | 'none';

export type ComponentThumbnailSource = {
  url?: string;
  size?: {
    width: number;
    height: number;
  };
  position?: ComponentThumbnailPosition;
  chrome?: ComponentThumbnailChrome;
};

export type NoyaAccessModifier = 'public' | 'internal';

export type NoyaComponent = {
  id: string;
  type: 'noyaComponent';
  name: string;
  description?: string;
  tags?: string[];
  thumbnail?: ComponentThumbnailSource;
  componentID: string;
  rootElement: NoyaNode;
  variants?: NoyaVariant[];
  accessModifier?: NoyaAccessModifier;
};

export type SelectedComponent = {
  componentID: string;
  variantID?: string;
  diff?: NoyaDiff;
};

export type StylingMode = 'inline' | 'tailwind';
