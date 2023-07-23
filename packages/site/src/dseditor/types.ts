export type NoyaString = {
  do_objectID: string;
  _class: 'noyaString';
  name?: string;
  value: string;
};

export type NoyaPrimitiveElement = {
  do_objectID: string;
  _class: 'noyaPrimitiveElement';
  name?: string;
  componentID: string;
  classNames: string[];
  children: NoyaNode[];
};

export type NoyaCompositeElement = {
  do_objectID: string;
  _class: 'noyaCompositeElement';
  name?: string;
  componentID: string;
};

export type NoyaElement = NoyaPrimitiveElement | NoyaCompositeElement;

export type NoyaNode = NoyaElement | NoyaString;

export type NoyaResolvedElement = Omit<NoyaPrimitiveElement, 'children'> & {
  children: NoyaResolvedNode[];
};

export type NoyaResolvedNode = NoyaResolvedElement | NoyaString | null;

export type NoyaComponent = {
  do_objectID: string;
  _class: 'noyaComponent';
  name: string;
  rootElement: NoyaElement;
  componentID: string;
};
