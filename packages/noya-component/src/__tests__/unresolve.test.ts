/* eslint-disable testing-library/await-async-query */
import {
  Model,
  NoyaNode,
  NoyaResolvedNode,
  ResolvedHierarchy,
  added,
} from 'noya-component';
import { createResolvedNode, unresolve } from '../traversal';
import { MockState } from './MockState';

it('unresolves string', () => {
  const node = Model.string('Hello');

  const resolvedNode = createResolvedNode({
    findComponent: () => undefined,
    node,
  });

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves primitive', () => {
  const node = Model.primitiveElement('box');

  const resolvedNode = createResolvedNode({
    findComponent: () => undefined,
    node,
  });

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves component', () => {
  const state = new MockState();

  const component = state.addComponent({
    componentID: 'hero',
    rootElement: Model.primitiveElement('box'),
  });

  const node = Model.compositeElement({
    componentID: component.componentID,
  });

  const resolvedNode = createResolvedNode({
    findComponent: state.findComponent,
    node,
  });

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves component with diff', () => {
  const state = new MockState();

  const component = state.addComponent({
    componentID: 'hero',
    rootElement: Model.primitiveElement({
      id: 'b',
      componentID: 'box',
    }),
  });

  const node = Model.compositeElement({
    id: 'a',
    componentID: component.componentID,
    diff: Model.diff([
      Model.diffItem({
        path: ['b'],
        children: [
          added(
            Model.string({
              id: 's',
              value: 'Hello',
            }),
            0,
          ),
        ],
      }),
    ]),
  });

  const resolvedNode = createResolvedNode({
    findComponent: state.findComponent,
    node,
  });

  // expect the resolved box primitive to have a string child
  expect(
    ResolvedHierarchy.findByPath(resolvedNode, ['a', 'b', 's'])?.type,
  ).toEqual('noyaString');

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves component with diff 2', () => {
  const state = new MockState();

  const component = state.addComponent({
    componentID: 'hero',
    rootElement: Model.primitiveElement({
      id: 'b',
      componentID: 'box',
      children: [
        Model.primitiveElement({
          id: 'avatar',
          componentID: 'avatar',
          children: [],
        }),
      ],
    }),
  });

  const node = Model.compositeElement({
    id: 'a',
    componentID: component.componentID,
    diff: Model.diff([
      Model.diffItem({
        path: ['b', 'avatar'],
        children: [
          added(
            Model.string({
              id: 's',
              value: 'Hello',
            }),
            0,
          ),
        ],
      }),
    ]),
  });

  const resolvedNode = createResolvedNode({
    findComponent: state.findComponent,
    node,
  });

  // expect the resolved box primitive to have a string child
  expect(
    ResolvedHierarchy.findByPath(resolvedNode, ['a', 'b', 'avatar', 's'])?.type,
  ).toEqual('noyaString');

  const unresolvedNode = unresolve(resolvedNode);

  expect(unresolvedNode).toEqual(node);
});

it('unresolves nested example', () => {
  const instance: NoyaResolvedNode = {
    id: 'c46747c9-d902-4a50-9339-5b5b0800ecd1',
    name: 'SectionPrimitive',
    type: 'noyaPrimitiveElement',
    componentID: 'box',
    props: [],
    classNames: [],
    children: [
      {
        id: 'e83959eb-aedf-49b4-a883-a86799c210cf',
        name: 'InsertedFlexLayout',
        type: 'noyaCompositeElement',
        componentID: 'f',
        diff: {
          items: [
            {
              path: ['4123dc59-8121-4605-9cb4-fb6b64e447c5'],
              children: [
                [
                  'a',
                  {
                    id: 'bf57fca6-f645-49fb-9781-3ea3d13153a7',
                    name: 'InsertedGridLayout',
                    type: 'noyaCompositeElement',
                    componentID: 'g',
                  },
                  0,
                ],
              ],
            },
          ],
        },
        rootElement: {
          name: 'FlexPrimitive',
          componentID: 'box',
          id: '4123dc59-8121-4605-9cb4-fb6b64e447c5',
          classNames: [],
          props: [],
          children: [
            {
              id: 'bf57fca6-f645-49fb-9781-3ea3d13153a7',
              name: 'InsertedGridLayout',
              type: 'noyaCompositeElement',
              componentID: 'g',
              rootElement: {
                name: 'GridPrimitive',
                componentID: 'box',
                id: '025d7ef5-ad08-4049-9232-75be87f4af6b',
                classNames: [],
                props: [],
                children: [],
                type: 'noyaPrimitiveElement',
                path: [
                  'c46747c9-d902-4a50-9339-5b5b0800ecd1',
                  'e83959eb-aedf-49b4-a883-a86799c210cf',
                  '4123dc59-8121-4605-9cb4-fb6b64e447c5',
                  'bf57fca6-f645-49fb-9781-3ea3d13153a7',
                  '025d7ef5-ad08-4049-9232-75be87f4af6b',
                ],
              },
              path: [
                'c46747c9-d902-4a50-9339-5b5b0800ecd1',
                'e83959eb-aedf-49b4-a883-a86799c210cf',
                '4123dc59-8121-4605-9cb4-fb6b64e447c5',
                'bf57fca6-f645-49fb-9781-3ea3d13153a7',
              ],
            },
          ],
          type: 'noyaPrimitiveElement',
          path: [
            'c46747c9-d902-4a50-9339-5b5b0800ecd1',
            'e83959eb-aedf-49b4-a883-a86799c210cf',
            '4123dc59-8121-4605-9cb4-fb6b64e447c5',
          ],
        },
        path: [
          'c46747c9-d902-4a50-9339-5b5b0800ecd1',
          'e83959eb-aedf-49b4-a883-a86799c210cf',
        ],
      },
    ],
    path: ['c46747c9-d902-4a50-9339-5b5b0800ecd1'],
  };

  const diff = Model.diff([
    {
      path: [
        'c46747c9-d902-4a50-9339-5b5b0800ecd1',
        'e83959eb-aedf-49b4-a883-a86799c210cf',
        '4123dc59-8121-4605-9cb4-fb6b64e447c5',
        'bf57fca6-f645-49fb-9781-3ea3d13153a7',
        '025d7ef5-ad08-4049-9232-75be87f4af6b',
      ],
      classNames: [
        [
          'a',
          {
            value: 'foo',
            id: '88ab58cf-f8a2-44c5-ace0-bc6a38678ae2',
          },
          0,
        ],
      ],
    },
  ]);

  const newRootElement = unresolve(instance, diff);

  const output: NoyaNode = {
    id: 'c46747c9-d902-4a50-9339-5b5b0800ecd1',
    name: 'SectionPrimitive',
    type: 'noyaPrimitiveElement',
    componentID: 'box',
    props: [],
    classNames: [],
    children: [
      {
        id: 'e83959eb-aedf-49b4-a883-a86799c210cf',
        name: 'InsertedFlexLayout',
        type: 'noyaCompositeElement',
        componentID: 'f',
        diff: {
          items: [
            {
              path: ['4123dc59-8121-4605-9cb4-fb6b64e447c5'],
              children: [
                [
                  'a',
                  {
                    id: 'bf57fca6-f645-49fb-9781-3ea3d13153a7',
                    name: 'InsertedGridLayout',
                    type: 'noyaCompositeElement',
                    componentID: 'g',
                  },
                  0,
                ],
              ],
            },
            {
              path: [
                '4123dc59-8121-4605-9cb4-fb6b64e447c5',
                'bf57fca6-f645-49fb-9781-3ea3d13153a7',
                '025d7ef5-ad08-4049-9232-75be87f4af6b',
              ],
              classNames: [
                [
                  'a',
                  { value: 'foo', id: '88ab58cf-f8a2-44c5-ace0-bc6a38678ae2' },
                  0,
                ],
              ],
            },
          ],
        },
      },
    ],
  };

  expect(newRootElement).toEqual(output);
});
