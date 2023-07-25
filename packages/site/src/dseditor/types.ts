export type NoyaString = {
  id: string;
  type: 'noyaString';
  name?: string;
  value: string;
};

export type NoyaPrimitiveElement = {
  id: string;
  type: 'noyaPrimitiveElement';
  componentID: string;
  name?: string;
  classNames: string[];
  children: NoyaNode[];
};

export type NoyaCompositeElement = {
  id: string;
  type: 'noyaCompositeElement';
  componentID: string;
  name?: string;
  diff?: NoyaComponentDiff;
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

export type NoyaComponent = {
  id: string;
  type: 'noyaComponent';
  name: string;
  rootElement: NoyaElement;
  componentID: string;
};
