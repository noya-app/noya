import { NoyaComponent, added, removed } from 'noya-component';
import { uuid } from 'noya-utils';
import {
  boxSymbolId,
  buttonSymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  linkSymbolId,
  tagSymbolId,
  textSymbolId,
} from '../ayon/symbols/symbolIds';
import { Model } from './builders';

const sidebarItemSymbolId = uuid();
const sidebarItemActiveVariantId = uuid();
const sidebarItemStringId = uuid();
const sidebarSymbolId = uuid();

export const initialComponents: NoyaComponent[] = [
  Model.component({
    name: 'Sidebar Item',
    componentID: sidebarItemSymbolId,
    rootElement: Model.primitiveElement({
      id: 'b',
      componentID: buttonSymbolId,
      children: [
        Model.string({
          id: sidebarItemStringId,
          value: 'Home',
        }),
      ],
      classNames: Model.classNames([
        'text-left',
        'justify-start',
        'variant-text',
      ]),
    }),
    variants: [
      Model.variant({
        id: sidebarItemActiveVariantId,
        name: 'Active',
        diff: {
          items: [
            {
              path: ['b'],
              classNames: [
                added(Model.className('bg-primary-900'), 0),
                added(Model.className('text-white'), 1),
              ],
            },
          ],
        },
      }),
      Model.variant({
        name: 'With Icon',
        diff: {
          items: [
            {
              path: ['b'],
              children: [
                added(
                  Model.primitiveElement({
                    id: 'icon',
                    componentID: buttonSymbolId,
                    classNames: Model.classNames([
                      'w-4',
                      'h-4',
                      'bg-primary-500',
                    ]),
                    children: [Model.string('+')],
                  }),
                  1,
                ),
              ],
            },
          ],
        },
      }),
    ],
  }),
  Model.component({
    name: 'Sidebar',
    componentID: sidebarSymbolId,
    rootElement: Model.primitiveElement({
      id: 'sidebar',
      componentID: boxSymbolId,
      classNames: Model.classNames([
        'flex-1',
        'flex',
        'flex-col',
        'gap-4',
        'bg-white',
        'p-4',
      ]),
      children: [
        Model.compositeElement({
          id: '1',
          componentID: sidebarItemSymbolId,
          variantNames: [Model.variantName(sidebarItemActiveVariantId)],
        }),
        Model.compositeElement({
          id: '2',
          componentID: sidebarItemSymbolId,
          diff: {
            items: [
              {
                path: ['b'],
                classNames: [
                  added(Model.className('bg-primary-900'), 0),
                  added(Model.className('text-white'), 1),
                ],
              },
              {
                path: ['b', sidebarItemStringId],
                textValue: 'Dashboard',
              },
            ],
          },
        }),
        Model.compositeElement({
          id: '3',
          componentID: sidebarItemSymbolId,
        }),
        Model.compositeElement({
          id: '4',
          componentID: sidebarItemSymbolId,
        }),
      ],
    }),
    variants: [
      Model.variant({
        name: 'With Title',
        diff: {
          items: [
            {
              path: ['sidebar'],
              // children: {
              //   add: [
              //     {
              //       node: Model.primitiveElement({
              //         id: 'title',
              //         componentID: textSymbolId,
              //         children: [Model.string('Title')],
              //         classNames: Model.classNames(['variant-h4']),
              //       }),
              //       index: 0,
              //     },
              //     {
              //       node: Model.compositeElement({
              //         id: 'extra',
              //         componentID: sidebarItemSymbolId,
              //       }),
              //       index: 1,
              //     },
              //   ],
              // },
            },
            {
              path: ['sidebar', '1', 'b'],
              classNames: [added(Model.className('bg-blue-500'), 0)],
            },
          ],
        },
      }),
    ],
  }),
  Model.component({
    name: 'Super Sidebar',
    componentID: uuid(),
    rootElement: Model.primitiveElement({
      componentID: boxSymbolId,
      children: [
        Model.compositeElement({
          componentID: sidebarSymbolId,
          diff: {
            items: [
              {
                path: ['sidebar', '3', 'b', sidebarItemStringId],
                textValue: 'yoo',
              },
              {
                path: ['sidebar', '3', 'b'],
                classNames: [added(Model.className('bg-orange-500'), 0)],
              },
            ],
          },
        }),
      ],
    }),
  }),
  Model.component({
    name: 'Hero',
    componentID: heroSymbolId,
    rootElement: Model.primitiveElement({
      id: 'box',
      name: 'Content',
      classNames: Model.classNames([
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'p-10',
        'flex-1',
        'gap-4',
      ]),
      componentID: boxSymbolId,
      children: [
        Model.primitiveElement({
          componentID: tagSymbolId,
          children: [Model.string('New')],
        }),
        Model.primitiveElement({
          name: 'Title',
          componentID: textSymbolId,
          children: [Model.string('Create, iterate, inspire.')],
          classNames: Model.classNames([
            'variant-h1',
            'leading-none',
            'text-center',
          ]),
        }),
        Model.primitiveElement({
          name: 'Subtitle',
          componentID: textSymbolId,
          children: [Model.string('Turn great ideas into new possibilities.')],
          classNames: Model.classNames([
            'variant-h4',
            'leading-none',
            'text-center',
          ]),
        }),
        Model.primitiveElement({
          id: 'a',
          name: 'Actions Row',
          classNames: Model.classNames([
            'flex',
            'items-center',
            'gap-4',
            'mt-2',
          ]),
          componentID: boxSymbolId,
          children: [
            Model.primitiveElement({
              componentID: buttonSymbolId,
              children: [Model.string('Get Started')],
            }),
            Model.primitiveElement({
              componentID: linkSymbolId,
              children: [Model.string('Learn More')],
            }),
          ],
        }),
      ],
    }),
  }),
  Model.component({
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
    rootElement: Model.primitiveElement({
      id: 'hwiroot',
      name: 'Root',
      componentID: boxSymbolId,
      classNames: Model.classNames([
        'flex-1',
        'grid',
        'grid-flow-col',
        'auto-cols-fr',
      ]),
      children: [
        Model.compositeElement({
          componentID: heroSymbolId,
          diff: {
            items: [
              {
                path: ['box'],
                classNames: [
                  removed(2), // items-center
                  added(Model.className('items-start'), 0),
                ],
              },
            ],
          },
        }),
        Model.primitiveElement({
          name: 'Image',
          componentID: boxSymbolId,
          classNames: Model.classNames(['w-full', 'h-full', 'bg-gray-200']),
        }),
      ],
    }),
  }),
];
