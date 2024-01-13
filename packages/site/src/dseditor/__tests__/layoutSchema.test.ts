import { component } from '@noya-design-system/protocol';
import {
  Model,
  NoyaPrimitiveElement,
  NoyaString,
  selectOptionSymbolId,
} from 'noya-component';
import { enforceSchema } from '../layoutSchema';

describe('none', () => {
  test('removes children', () => {
    const root = Model.primitiveElement({
      componentID: component.id.Image,
      children: [Model.string({ value: 'foo' })],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(0);
  });
});

describe('nodes', () => {
  test('wraps string child', () => {
    const root = Model.primitiveElement({
      componentID: component.id.Box,
      children: [Model.string({ value: 'foo' })],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(1);
    expect((result.children[0] as NoyaPrimitiveElement).componentID).toEqual(
      component.id.Text,
    );
  });
});

describe('stringOrNodes', () => {
  test('adds empty string child', () => {
    const root = Model.primitiveElement({ componentID: component.id.Button });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(1);
  });

  test('merges strings', () => {
    const root = Model.primitiveElement({
      componentID: component.id.Button,
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
      componentID: component.id.Button,
      children: [
        Model.string({ value: 'foo' }),
        Model.primitiveElement({
          componentID: component.id.Image,
        }),
      ],
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.children.length).toEqual(2);
    expect((result.children[0] as NoyaPrimitiveElement).componentID).toEqual(
      component.id.Text,
    );
  });
});

describe('select with option children', () => {
  test('removes non-option child', () => {
    const root = Model.primitiveElement({
      componentID: component.id.Select,
      children: [
        Model.string({ value: 'foo' }),
        Model.primitiveElement({
          componentID: selectOptionSymbolId,
          children: [],
        }),
        Model.primitiveElement(component.id.Box),
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
      componentID: component.id.Image,
    });
    const result = enforceSchema(root) as NoyaPrimitiveElement;
    expect(result.props.length).toEqual(1);
    expect(result.props[0].name).toEqual('src');
  });
});
