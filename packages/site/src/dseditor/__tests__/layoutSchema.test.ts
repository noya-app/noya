import {
  boxSymbolId,
  buttonSymbolId,
  imageSymbolId,
  selectOptionSymbolId,
  selectSymbolId,
  textSymbolId,
} from '../../ayon/symbols/symbolIds';
import { Model } from '../builders';
import { enforceSchema } from '../layoutSchema';
import { NoyaPrimitiveElement, NoyaString } from '../types';

describe('none', () => {
  test('removes children', () => {
    const root = Model.primitiveElement({
      componentID: imageSymbolId,
      children: [Model.string({ value: 'foo' })],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(0);
  });
});

describe('nodes', () => {
  test('removes string child', () => {
    const root = Model.primitiveElement({
      componentID: boxSymbolId,
      children: [Model.string({ value: 'foo' })],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(0);
  });
});

describe('stringOrNodes', () => {
  test('adds empty string child', () => {
    const root = Model.primitiveElement({ componentID: buttonSymbolId });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(1);
  });

  test('merges strings', () => {
    const root = Model.primitiveElement({
      componentID: buttonSymbolId,
      children: [
        Model.string({ value: 'foo' }),
        Model.string({ value: 'bar' }),
      ],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(1);
    expect((result.children[0] as NoyaString).value).toEqual('foobar');
  });

  test('wraps string child in text element if there is a node', () => {
    const root = Model.primitiveElement({
      componentID: buttonSymbolId,
      children: [
        Model.string({ value: 'foo' }),
        Model.primitiveElement({
          componentID: imageSymbolId,
        }),
      ],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect((result.children[0] as NoyaPrimitiveElement).componentID).toEqual(
      textSymbolId,
    );
  });
});

describe('select with option children', () => {
  test('removes non-option child', () => {
    const root = Model.primitiveElement({
      componentID: selectSymbolId,
      children: [
        Model.string({ value: 'foo' }),
        Model.primitiveElement({
          componentID: selectOptionSymbolId,
          children: [],
        }),
        Model.primitiveElement(boxSymbolId),
      ],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(1);
    expect((result.children[0] as NoyaPrimitiveElement).componentID).toEqual(
      selectOptionSymbolId,
    );
  });
});

describe('props', () => {
  test('adds image src prop', () => {
    const root = Model.primitiveElement({
      componentID: imageSymbolId,
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.props.length).toEqual(1);
    expect(result.props[0].name).toEqual('src');
  });
});
