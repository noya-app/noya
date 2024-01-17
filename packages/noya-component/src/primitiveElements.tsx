import {
  AvatarIcon,
  BadgeIcon,
  BoxIcon,
  ButtonIcon,
  CheckboxIcon,
  DividerHorizontalIcon,
  DropdownMenuIcon,
  ImageIcon,
  InputIcon,
  Link1Icon,
  RadiobuttonIcon,
  SwitchIcon,
  TextIcon,
} from '@noya-app/noya-icons';
import { component } from '@noya-design-system/protocol';
import { Model, NoyaPrimitiveElement } from 'noya-component';
import React, { ReactNode } from 'react';

export const selectOptionSymbolId = 'a4009f44-db30-4658-9bcb-7531434150bb';

export type PrimitiveElementSchema = {
  children:
    | 'none'
    | 'stringOrNodes'
    | 'nodes'
    | { type: 'elementOfType'; componentId: string };
  props?: Record<string, 'image' | 'string' | 'number'>;
};

export type PrimitiveElementMetadata = {
  id: string;
  name: string;
  description: string;
  aliases?: string[];
  icon?: ReactNode;
  schema: PrimitiveElementSchema;
  initialValue?: () => NoyaPrimitiveElement;
  variants?: string[];
};

export const primitiveElements: PrimitiveElementMetadata[] = [
  {
    id: component.id.Avatar,
    name: 'Avatar',
    description: 'A user avatar',
    icon: <AvatarIcon />,
    schema: { children: 'none' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Avatar',
        componentID: component.id.Avatar,
        classNames: [],
      }),
  },
  {
    id: component.id.Box,
    name: 'Box',
    description: 'A container for other elements',
    icon: <BoxIcon />,
    schema: { children: 'nodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Box',
        componentID: component.id.Box,
        classNames: Model.classNames(['flex-1', 'bg-primary-50']),
      }),
  },
  {
    id: component.id.Button,
    name: 'Button',
    description: 'A button with the text "Submit"',
    icon: <ButtonIcon />,
    schema: { children: 'stringOrNodes' },
    variants: ['solid', 'outline', 'text'],
    initialValue: () =>
      Model.primitiveElement({
        name: 'Button',
        componentID: component.id.Button,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Submit')],
      }),
  },
  {
    id: component.id.Card,
    name: 'Card',
    description: 'A card',
    icon: <BoxIcon />,
    schema: { children: 'nodes' },
    variants: ['elevated', 'outline', 'solid'],
    initialValue: () =>
      Model.primitiveElement({
        name: 'Card',
        componentID: component.id.Card,
        classNames: Model.classNames(['flex-1', 'p-4']),
      }),
  },
  {
    id: component.id.Checkbox,
    name: 'Checkbox',
    description: 'A checkbox with the label "Checkbox"',
    icon: <CheckboxIcon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Checkbox',
        componentID: component.id.Checkbox,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Checkbox')],
      }),
  },
  {
    id: component.id.Image,
    name: 'Image',
    description: 'An image',
    icon: <ImageIcon />,
    schema: {
      children: 'none',
      props: {
        src: 'image',
      },
    },
    aliases: ['Photo', 'Picture'],
    initialValue: () =>
      Model.primitiveElement({
        name: 'Image',
        componentID: component.id.Image,
        classNames: Model.classNames(['flex-1', 'object-cover']),
      }),
  },
  {
    id: component.id.Input,
    name: 'Input',
    description: 'A text input',
    icon: <InputIcon />,
    schema: {
      children: 'none',
      props: {
        placeholder: 'string',
      },
    },
    initialValue: () =>
      // We likely don't want flex-1 on inputs. It doesn't look great and
      // if they user then puts them into a stack, they'll stretch strangely.
      // Instead the user should be using textarea (maybe we can suggest this).
      Model.primitiveElement({
        name: 'Input',
        componentID: component.id.Input,
        props: [
          Model.stringProp({ name: 'placeholder', value: 'Placeholder' }),
        ],
      }),
  },
  {
    id: component.id.Link,
    name: 'Link',
    description: 'A link with the text "Link"',
    icon: <Link1Icon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Link',
        componentID: component.id.Link,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Link')],
      }),
  },
  {
    id: component.id.Progress,
    name: 'Progress',
    description: 'A progress bar',
    icon: <DividerHorizontalIcon />,
    schema: { children: 'none', props: { value: 'number' } },
  },
  {
    id: component.id.Radio,
    name: 'Radio',
    description: 'A radio button with the label "Radio"',
    icon: <RadiobuttonIcon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Radio',
        componentID: component.id.Radio,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Radio')],
      }),
  },
  {
    id: component.id.Select,
    name: 'Select',
    description: 'A select menu with options "Option 1" and "Option 2"',
    icon: <DropdownMenuIcon />,
    aliases: ['Dropdown'],
    schema: {
      children: { type: 'elementOfType', componentId: selectOptionSymbolId },
    },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Select',
        componentID: component.id.Select,
        classNames: Model.classNames(['flex-1']),
        children: [
          Model.primitiveElement({
            name: 'Option 1',
            componentID: selectOptionSymbolId,
            classNames: Model.classNames(['flex-1']),
          }),
          Model.primitiveElement({
            name: 'Option 2',
            componentID: selectOptionSymbolId,
            classNames: Model.classNames(['flex-1']),
          }),
        ],
      }),
  },
  {
    id: selectOptionSymbolId,
    name: 'Option',
    description: 'An option in a select menu',
    icon: <DropdownMenuIcon />,
    schema: { children: 'none' },
    aliases: ['Select Option', 'Dropdown Option'],
  },
  {
    id: component.id.Switch,
    name: 'Switch',
    description: 'A switch',
    icon: <SwitchIcon />,
    schema: { children: 'none' },
    aliases: ['Toggle'],
  },
  // {
  //   id: tableSymbolId,
  //   name: 'Table',
  //   description: 'A table',
  //   icon: <TableIcon />,
  //   schema: { children: 'none' },
  // },
  {
    id: component.id.Tag,
    name: 'Tag',
    description: 'A tag with the text "Tag"',
    icon: <BadgeIcon />,
    variants: ['solid', 'outline'],
    aliases: ['Badge', 'Chip'],
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Tag',
        componentID: component.id.Tag,
        classNames: Model.classNames(['self-start']),
        children: [Model.string('Tag')],
      }),
  },
  {
    id: component.id.Text,
    name: 'Text',
    description: 'A text element with the text "Text"',
    icon: <TextIcon />,
    aliases: ['Label'],
    schema: { children: 'stringOrNodes' },
    variants: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'subtitle1',
      'subtitle2',
      'body1',
      'body2',
      'caption1',
    ],
    initialValue: () =>
      Model.primitiveElement({
        name: 'Text',
        componentID: component.id.Text,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Text')],
      }),
  },
  {
    id: component.id.Textarea,
    name: 'Textarea',
    description: 'A text area that the user can type into',
    icon: <InputIcon />,
    schema: {
      children: 'none',
      props: {
        placeholder: 'string',
      },
    },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Textarea',
        componentID: component.id.Textarea,
        classNames: Model.classNames(['flex-1', 'h-full', 'min-h-0']),
        props: [
          Model.stringProp({ name: 'placeholder', value: 'Placeholder' }),
        ],
      }),
  },
];

export const PRIMITIVE_ELEMENT_MAP: Record<string, PrimitiveElementMetadata> =
  Object.fromEntries(primitiveElements.map((element) => [element.id, element]));

export const PRIMITIVE_ELEMENT_NAMES: Record<string, string> =
  Object.fromEntries(
    primitiveElements.map((element) => [element.id, element.name]),
  );

// Lowercase tag name => primitive element
export const PRIMITIVE_TAG_MAP: Record<string, PrimitiveElementMetadata> =
  Object.fromEntries(
    primitiveElements.flatMap((element) => [
      [element.name.toLowerCase(), element],
      ...(element.aliases || []).map((alias) => [alias.toLowerCase(), element]),
    ]),
  );

// In case the AI generates a tag name that doesn't match the primitive element name
PRIMITIVE_TAG_MAP['img'] = PRIMITIVE_TAG_MAP['image'];
PRIMITIVE_TAG_MAP['div'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['main'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['section'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['header'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['footer'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['span'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['label'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['p'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h1'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h2'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h3'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h4'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h5'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h6'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['ul'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['ol'] = PRIMITIVE_TAG_MAP['box'];
PRIMITIVE_TAG_MAP['li'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['a'] = PRIMITIVE_TAG_MAP['link'];

export function isPrimitiveElementId(id: string) {
  return id in PRIMITIVE_ELEMENT_MAP;
}

export function initialPrimitiveValue(
  primitiveElement: PrimitiveElementMetadata,
): NoyaPrimitiveElement {
  return (
    primitiveElement.initialValue?.() ??
    Model.primitiveElement({
      name: primitiveElement.name,
      componentID: primitiveElement.id,
      classNames: Model.classNames(['flex-1']),
    })
  );
}
