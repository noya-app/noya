import {
  AvatarIcon,
  BadgeIcon,
  BoxIcon,
  ButtonIcon,
  CheckboxIcon,
  DropdownMenuIcon,
  ImageIcon,
  InputIcon,
  Link1Icon,
  RadiobuttonIcon,
  SwitchIcon,
  TableIcon,
  TextIcon,
} from 'noya-icons';
import React, { ReactNode } from 'react';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  checkboxSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  radioSymbolId,
  selectOptionSymbolId,
  selectSymbolId,
  switchSymbolId,
  tableSymbolId,
  tagSymbolId,
  textSymbolId,
  textareaSymbolId,
} from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import { NoyaPrimitiveElement } from './types';

export type PrimitiveElementSchema = {
  children: 'none' | 'stringOrNodes' | 'nodes';
  props?: Record<string, 'image'>;
};

export type PrimitiveElementMetadata = {
  id: string;
  name: string;
  aliases?: string[];
  icon?: ReactNode;
  schema: PrimitiveElementSchema;
  initialValue?: () => NoyaPrimitiveElement;
};

export const primitiveElements: PrimitiveElementMetadata[] = [
  {
    id: avatarSymbolId,
    name: 'Avatar',
    icon: <AvatarIcon />,
    schema: { children: 'none' },
  },
  {
    id: boxSymbolId,
    name: 'Box',
    icon: <BoxIcon />,
    schema: { children: 'nodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Box',
        componentID: boxSymbolId,
        classNames: Model.classNames(['flex-1', 'bg-primary-50']),
      }),
  },
  {
    id: buttonSymbolId,
    name: 'Button',
    icon: <ButtonIcon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Button',
        componentID: buttonSymbolId,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Submit')],
      }),
  },
  {
    id: checkboxSymbolId,
    name: 'Checkbox',
    icon: <CheckboxIcon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Checkbox',
        componentID: checkboxSymbolId,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Checkbox')],
      }),
  },
  {
    id: imageSymbolId,
    name: 'Image',
    icon: <ImageIcon />,
    schema: {
      children: 'none',
      props: {
        src: 'image',
      },
    },
    aliases: ['Photo', 'Picture'],
  },
  {
    id: inputSymbolId,
    name: 'Input',
    icon: <InputIcon />,
    schema: { children: 'none' },
  },
  {
    id: linkSymbolId,
    name: 'Link',
    icon: <Link1Icon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Link',
        componentID: linkSymbolId,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Link')],
      }),
  },
  {
    id: radioSymbolId,
    name: 'Radio',
    icon: <RadiobuttonIcon />,
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Radio',
        componentID: radioSymbolId,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Radio')],
      }),
  },
  {
    id: selectSymbolId,
    name: 'Select',
    icon: <DropdownMenuIcon />,
    aliases: ['Dropdown'],
    schema: { children: 'none' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Select',
        componentID: selectSymbolId,
        classNames: Model.classNames(['flex-1']),
        children: [
          Model.primitiveElement({
            name: 'Option',
            componentID: selectOptionSymbolId,
            classNames: Model.classNames(['flex-1']),
          }),
        ],
      }),
  },
  {
    id: selectOptionSymbolId,
    name: 'Option',
    icon: <DropdownMenuIcon />,
    schema: { children: 'none' },
    aliases: ['Select Option', 'Dropdown Option'],
  },
  {
    id: switchSymbolId,
    name: 'Switch',
    icon: <SwitchIcon />,
    schema: { children: 'none' },
    aliases: ['Toggle'],
  },
  {
    id: tableSymbolId,
    name: 'Table',
    icon: <TableIcon />,
    schema: { children: 'none' },
  },
  {
    id: tagSymbolId,
    name: 'Tag',
    icon: <BadgeIcon />,
    aliases: ['Badge', 'Chip'],
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Tag',
        componentID: tagSymbolId,
        classNames: Model.classNames(['self-start']),
        children: [Model.string('Tag')],
      }),
  },
  {
    id: textSymbolId,
    name: 'Text',
    icon: <TextIcon />,
    aliases: ['Label'],
    schema: { children: 'stringOrNodes' },
    initialValue: () =>
      Model.primitiveElement({
        name: 'Text',
        componentID: textSymbolId,
        classNames: Model.classNames(['flex-1']),
        children: [Model.string('Text')],
      }),
  },
  {
    id: textareaSymbolId,
    name: 'Textarea',
    icon: <InputIcon />,
    schema: { children: 'none' },
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
PRIMITIVE_TAG_MAP['span'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['p'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h1'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h2'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h3'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h4'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h5'] = PRIMITIVE_TAG_MAP['text'];
PRIMITIVE_TAG_MAP['h6'] = PRIMITIVE_TAG_MAP['text'];
