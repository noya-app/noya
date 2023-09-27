import { readFileSync } from 'fs';
import path from 'path';
import { parseLayout } from '../componentLayout';
import { NoyaGeneratorProp, NoyaPrimitiveElement } from '../types';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../../safelist.txt', () => {
  return {
    default: readFileSync(
      path.join(__dirname, '../../../safelist.txt'),
      'utf8',
    ),
  };
});

// Sometimes generated layouts will have references to images that don't exist
// e.g. logo.png, so we ignore any generated image srcs
it('ignores image src', () => {
  const element = parseLayout(
    '<Image src="https://via.placeholder.com/150" />',
  ) as NoyaPrimitiveElement;

  const prop0 = element.props[0] as NoyaGeneratorProp;

  expect(prop0.type).toEqual('generator');
  expect(prop0.generator).toEqual('random-image');
  expect(prop0.query).toEqual('landscape');
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
