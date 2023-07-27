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
  classNames: string[];
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
  variantID?: string;
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
  status?: 'added' | 'removed';
};
export type NoyaResolvedPrimitiveElement = Omit<
  NoyaPrimitiveElement,
  'children' | 'classNames'
> & {
  children: NoyaResolvedNode[];
  path: string[];
  classNames: NoyaResolvedClassName[];
  status?: 'added' | 'removed';
};
export type NoyaResolvedString = NoyaString & {
  path: string[];
  status?: 'added' | 'removed';
};
export type NoyaResolvedClassName = {
  value: string;
  status?: 'added' | 'removed';
};

export type NoyaDiffItem = {
  path: string[];
  classNames?: {
    add?: string[];
    remove?: string[];
  };
  children?: {
    add?: NoyaNode[];
    remove?: string[];
  };
};

export type NoyaDiff = {
  items: NoyaDiffItem[];
};

export type NoyaVariant = {
  id: string;
  name?: string;
  diff: NoyaDiff;
};

export type NoyaComponent = {
  id: string;
  type: 'noyaComponent';
  name: string;
  description?: string;
  componentID: string;
  rootElement: NoyaElement;
  variants?: NoyaVariant[];
};

export type SelectedComponent = {
  componentID: string;
  variantID?: string;
};
