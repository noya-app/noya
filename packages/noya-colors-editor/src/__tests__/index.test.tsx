import * as React from 'react';
import { render } from 'react-dom';
import NoyaColorsEditor from '../index';

test('it should render', () => {
  const el = document.createElement('div');
  expect(() => render(<NoyaColorsEditor />, el)).not.toThrow();
});
