import * as React from 'react';
import { render } from 'react-dom';
import NoyaJsonTool from '../index';

test('it should render', () => {
  const el = document.createElement('div');
  expect(() => render(<NoyaJsonTool />, el)).not.toThrow();
});
