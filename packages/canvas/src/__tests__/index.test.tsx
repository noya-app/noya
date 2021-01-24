import * as React from 'react';
import { render } from 'react-dom';
import Canvas from '../index';

test('it should render', () => {
  const el = document.createElement('div');
  expect(() => render(<Canvas />, el)).not.toThrow();
});
