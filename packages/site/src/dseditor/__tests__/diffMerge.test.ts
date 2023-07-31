import { Model } from '../builders';
import { mergeDiffs } from '../diffReducer';

it('merges add class names', () => {
  const a = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      classNames: {
        add: ['a'],
      },
    }),
  ]);

  const b = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      classNames: {
        add: ['b'],
      },
    }),
  ]);

  const merged = mergeDiffs(a, b);

  expect(merged.items).toEqual([
    {
      path: ['1', '2', '3'],
      classNames: {
        add: ['a', 'b'],
      },
    },
  ]);
});

it('merges remove class names', () => {
  const a = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      classNames: {
        add: ['a'],
      },
    }),
  ]);

  const b = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      classNames: {
        remove: ['a'],
      },
    }),
  ]);

  const merged = mergeDiffs(a, b);

  // TODO: We should check if the class name belongs to a primitive element or
  // if it was added in a diff. If it was added in a diff, we should remove it
  expect(merged.items).toEqual([
    {
      path: ['1', '2', '3'],
      classNames: {
        remove: ['a'],
      },
    },
  ]);
});

it('merges string values', () => {
  const a = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      textValue: 'a',
    }),
  ]);

  const b = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      textValue: 'b',
    }),
  ]);

  const merged = mergeDiffs(a, b);

  expect(merged.items).toEqual([
    {
      path: ['1', '2', '3'],
      textValue: 'b',
    },
  ]);
});

describe('merges children', () => {
  it('add + add', () => {
    const a = Model.diff([
      Model.diffItem({
        path: ['1', '2', '3'],
        children: {
          add: [{ node: Model.string({ value: 'a', id: 'a' }), index: 0 }],
        },
      }),
    ]);

    const b = Model.diff([
      Model.diffItem({
        path: ['1', '2', '3'],
        children: {
          add: [{ node: Model.string({ value: 'b', id: 'b' }), index: 1 }],
        },
      }),
    ]);

    const merged = mergeDiffs(a, b);

    expect(merged.items).toEqual([
      {
        path: ['1', '2', '3'],
        children: {
          add: [
            { node: Model.string({ value: 'a', id: 'a' }), index: 0 },
            { node: Model.string({ value: 'b', id: 'b' }), index: 1 },
          ],
        },
      },
    ]);
  });

  it('add + remove', () => {
    const a = Model.diff([
      Model.diffItem({
        path: ['1', '2', '3'],
        children: {
          add: [{ node: Model.string({ value: 'a', id: 'a' }), index: 0 }],
        },
      }),
    ]);

    const b = Model.diff([
      Model.diffItem({
        path: ['1', '2', '3'],
        children: {
          remove: ['a'],
        },
      }),
    ]);

    const merged = mergeDiffs(a, b);

    expect(merged.items).toEqual([
      {
        path: ['1', '2', '3'],
        children: {
          remove: ['a'],
        },
      },
    ]);
  });

  it('remove + remove', () => {
    const a = Model.diff([
      Model.diffItem({
        path: ['1', '2', '3'],
        children: {
          remove: ['a'],
        },
      }),
    ]);

    const b = Model.diff([
      Model.diffItem({
        path: ['1', '2', '3'],
        children: {
          remove: ['a'],
        },
      }),
    ]);

    const merged = mergeDiffs(a, b);

    expect(merged.items).toEqual([
      {
        path: ['1', '2', '3'],
        children: {
          remove: ['a'],
        },
      },
    ]);
  });
});

it('dedupes items by path within the same diff', () => {
  const a = Model.diff([
    Model.diffItem({
      path: ['1', '2', '3'],
      textValue: 'a',
    }),
    Model.diffItem({
      path: ['1', '2', '3'],
      textValue: 'a',
    }),
  ]);

  const b = Model.diff([]);

  const merged = mergeDiffs(a, b);

  expect(merged.items).toEqual([
    {
      path: ['1', '2', '3'],
      textValue: 'a',
    },
  ]);
});
