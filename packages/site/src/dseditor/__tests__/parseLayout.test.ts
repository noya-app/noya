import { readFileSync } from 'fs';
import path from 'path';
import { parseLayout } from '../componentLayout';
import {
  NoyaGeneratorProp,
  NoyaPrimitiveElement,
  NoyaStringProp,
} from '../types';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../../safelist.txt', () => {
  return {
    default: readFileSync(
      path.join(__dirname, '../../../safelist.txt'),
      'utf8',
    ),
  };
});

it('parses image src', () => {
  const element = parseLayout(
    '<Image src="https://via.placeholder.com/150" />',
  ) as NoyaPrimitiveElement;

  const prop0 = element.props[0] as NoyaStringProp;

  expect(prop0.type).toEqual('string');
  expect(prop0.name).toEqual('src');
  expect(prop0.value).toEqual('https://via.placeholder.com/150');
});

it('parses image alt', () => {
  const element = parseLayout(
    '<Image alt="Shopping related image" />',
  ) as NoyaPrimitiveElement;

  const prop0 = element.props[0] as NoyaGeneratorProp;

  expect(prop0.type).toEqual('generator');
  expect(prop0.name).toEqual('src');
  expect(prop0.query).toEqual('shopping');
});
