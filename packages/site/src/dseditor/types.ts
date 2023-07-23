export type NoyaElementType = 'primitive' | 'instance';

export type NoyaString = {
  do_objectID: string;
  _class: 'noyaString';
  name?: string;
  value: string;
};

export type NoyaElement = {
  do_objectID: string;
  _class: 'noyaElement';
  name?: string;
  type: NoyaElementType;
  componentID: string;
  children: NoyaNode[];
  classNames: string[];
};

export type NoyaNode = NoyaElement | NoyaString;

export type NoyaComponent = {
  do_objectID: string;
  _class: 'noyaComponent';
  name: string;
  rootElement: NoyaElement;
  componentID: string;
};
