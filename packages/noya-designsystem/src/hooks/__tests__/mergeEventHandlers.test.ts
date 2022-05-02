import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { mergeEventHandlers } from '../mergeEventHandlers';

const event = { defaultPrevented: false };

test('merges handlers', () => {
  const out: [number, any][] = [];

  const a: ReactEventHandlers = { onClick: (e) => out.push([1, e]) };
  const b: ReactEventHandlers = { onClick: (e) => out.push([2, e]) };
  const c: ReactEventHandlers = {};
  const d: ReactEventHandlers = { onClick: (e) => out.push([3, e]) };

  const result = mergeEventHandlers(a, b, c, d);

  result.onClick?.(event as any);

  expect(Object.keys(result)).toEqual(['onClick']);
  expect(typeof result.onClick).toEqual('function');
  expect(out).toEqual([
    [1, event],
    [2, event],
    [3, event],
  ]);
});

const noop = () => {};

test('merges multiple handlers', () => {
  const a: ReactEventHandlers = {
    onMouseDown: noop,
    onMouseMove: noop,
    onMouseUp: noop,
  };
  const b: ReactEventHandlers = {
    onMouseDown: noop,
    onMouseUp: noop,
  };

  const result = mergeEventHandlers(a, b);

  expect(Object.keys(result)).toEqual([
    'onMouseDown',
    'onMouseMove',
    'onMouseUp',
  ]);
});
