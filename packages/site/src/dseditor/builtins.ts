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
import { NoyaComponent } from './types';

export const PRIMITIVE_ELEMENT_NAMES = {
  [boxSymbolId]: 'Box',
  [buttonSymbolId]: 'Button',
  [linkSymbolId]: 'Link',
  [textSymbolId]: 'Text',
  [tagSymbolId]: 'Tag',
};

const sidebarItemSymbolId = uuid();
const sidebarItemActiveVariantId = uuid();

export const initialComponents: NoyaComponent[] = [
  Model.component({
    name: 'Sidebar Item',
    componentID: sidebarItemSymbolId,
    rootElement: Model.primitiveElement({
      id: 'b',
      componentID: buttonSymbolId,
      children: [Model.string('Home')],
      classNames: ['text-left', 'justify-start', 'variant-text'],
    }),
    variants: [
      Model.variant({
        id: sidebarItemActiveVariantId,
        name: 'Active',
        diff: {
          operations: [
            {
              path: ['b'],
              type: 'addParameters',
              value: ['bg-primary-500', 'text-white'],
            },
          ],
        },
      }),
    ],
  }),
  Model.component({
    name: 'Sidebar',
    componentID: uuid(),
    rootElement: Model.primitiveElement({
      id: 'sidebar',
      componentID: boxSymbolId,
      classNames: ['flex-1', 'flex', 'flex-col', 'gap-4', 'bg-white', 'p-4'],
      children: [
        Model.compositeElement({
          id: '1',
          componentID: sidebarItemSymbolId,
          variantID: sidebarItemActiveVariantId,
        }),
        Model.compositeElement({
          componentID: sidebarItemSymbolId,
        }),
        Model.compositeElement({
          componentID: sidebarItemSymbolId,
        }),
        Model.compositeElement({
          componentID: sidebarItemSymbolId,
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
      classNames: [
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'p-10',
        'flex-1',
      ],
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
          classNames: ['variant-h1', 'text-center'],
        }),
        Model.primitiveElement({
          name: 'Subtitle',
          componentID: textSymbolId,
          children: [Model.string('Turn great ideas into new possibilities.')],
          classNames: ['variant-h4', 'text-center'],
        }),
        Model.primitiveElement({
          id: 'a',
          name: 'Actions Row',
          classNames: ['flex', 'items-center', 'gap-4', 'mt-6'],
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
      id: 'root',
      name: 'Root',
      componentID: boxSymbolId,
      classNames: ['flex-1', 'grid', 'grid-flow-col', 'auto-cols-fr'],
      children: [
        Model.compositeElement({
          componentID: heroSymbolId,
          diff: {
            operations: [
              {
                path: ['box'],
                type: 'removeParameters',
                value: ['items-start'],
              },
              {
                path: ['box', 'a'],
                type: 'addParameters',
                value: ['flex-col'],
              },
              {
                path: ['box', 'a'],
                type: 'removeParameters',
                value: ['items-center'],
              },
            ],
          },
        }),
        Model.primitiveElement({
          name: 'Image',
          componentID: boxSymbolId,
          classNames: ['w-full', 'h-full', 'bg-gray-200'],
        }),
      ],
    }),
  }),
];
