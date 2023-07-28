import { uuid } from 'noya-utils';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  checkboxSymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  radioSymbolId,
  selectSymbolId,
  switchSymbolId,
  tableSymbolId,
  tagSymbolId,
  textSymbolId,
  textareaSymbolId,
} from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import { NoyaComponent } from './types';

export const PRIMITIVE_ELEMENT_NAMES = {
  [avatarSymbolId]: 'Avatar',
  [boxSymbolId]: 'Box',
  [buttonSymbolId]: 'Button',
  [checkboxSymbolId]: 'Checkbox',
  [imageSymbolId]: 'Image',
  [inputSymbolId]: 'Input',
  [linkSymbolId]: 'Link',
  [radioSymbolId]: 'Radio',
  [selectSymbolId]: 'Select',
  [switchSymbolId]: 'Switch',
  [tableSymbolId]: 'Table',
  [tagSymbolId]: 'Tag',
  [textSymbolId]: 'Text',
  [textareaSymbolId]: 'TextArea',
};

const sidebarItemSymbolId = uuid();
const sidebarItemActiveVariantId = uuid();
const sidebarItemStringId = uuid();

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
      classNames: ['text-left', 'justify-start', 'variant-text'],
    }),
    variants: [
      Model.variant({
        id: sidebarItemActiveVariantId,
        name: 'Active',
        diff: {
          items: [
            {
              path: ['b'],
              classNames: {
                add: ['bg-primary-500', 'text-white'],
              },
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
          id: '2',
          componentID: sidebarItemSymbolId,
          diff: {
            items: [
              {
                path: ['b'],
                classNames: {
                  add: ['bg-primary-900', 'text-white'],
                },
                children: {
                  remove: [sidebarItemStringId],
                  add: [Model.string('Dashboard')],
                },
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
              children: {
                add: [
                  Model.primitiveElement({
                    id: 'title',
                    componentID: textSymbolId,
                    children: [Model.string('Title')],
                    classNames: ['variant-h4'],
                  }),
                  Model.compositeElement({
                    id: 'extra',
                    componentID: sidebarItemSymbolId,
                  }),
                ],
              },
            },
            {
              path: ['sidebar', '1', 'b'],
              classNames: {
                add: ['bg-blue-500'],
              },
            },
          ],
        },
      }),
    ],
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
            items: [
              {
                path: ['box'],
                classNames: {
                  remove: ['items-center'],
                  add: ['items-start'],
                },
              },
              // {
              //   path: ['box', 'a'],
              //   classNames: {
              //     remove: ['items-center'],
              //     add: ['flex-col'],
              //   },
              // },
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
