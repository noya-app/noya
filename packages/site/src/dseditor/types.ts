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

export type NoyaPrimitiveElement = NoyaElementBase & {
  type: 'noyaPrimitiveElement';
  // Props
  classNames: string[];
  children: NoyaNode[];
};

export type NoyaCompositeElement = NoyaElementBase & {
  type: 'noyaCompositeElement';
  // Props
  diff?: NoyaComponentDiff;
  variantID?: string;
};

export type NoyaElement = NoyaPrimitiveElement | NoyaCompositeElement;

export type NoyaNode = NoyaElement | NoyaString;

export type NoyaResolvedElement = Omit<NoyaPrimitiveElement, 'children'> & {
  children: NoyaResolvedNode[];
};

export type NoyaResolvedNode = NoyaResolvedElement | NoyaString | null;

export type NoyaComponentOperation =
  | {
      type: 'addParameters';
      path: string[];
      value: string[];
    }
  | {
      type: 'removeParameters';
      path: string[];
      value: string[];
    };

export type NoyaComponentDiff = {
  operations: NoyaComponentOperation[];
};

export type NoyaVariant = {
  id: string;
  name?: string;
  diff: NoyaComponentDiff;
};

export type NoyaComponent = {
  id: string;
  type: 'noyaComponent';
  name: string;
  componentID: string;
  rootElement: NoyaElement;
  variants?: NoyaVariant[];
};
