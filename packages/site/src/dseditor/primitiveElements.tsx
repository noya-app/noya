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

export type PrimitiveElementMetadata = {
  id: string;
  name: string;
  aliases?: string[];
  icon?: ReactNode;
  // textEditing?: boolean;
  initialValue?: () => NoyaPrimitiveElement;
};

export const primitiveElements: PrimitiveElementMetadata[] = [
  { id: avatarSymbolId, name: 'Avatar', icon: <AvatarIcon /> },
  {
    id: boxSymbolId,
    name: 'Box',
    icon: <BoxIcon />,
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
    // textEditing: true,
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
    // textEditing: true,
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
    aliases: ['Photo', 'Picture'],
  },
  { id: inputSymbolId, name: 'Input', icon: <InputIcon /> },
  {
    id: linkSymbolId,
    name: 'Link',
    icon: <Link1Icon />,
    // textEditing: true,
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
    aliases: ['Select Option', 'Dropdown Option'],
  },
  {
    id: switchSymbolId,
    name: 'Switch',
    icon: <SwitchIcon />,
    aliases: ['Toggle'],
  },
  { id: tableSymbolId, name: 'Table', icon: <TableIcon /> },
  {
    id: tagSymbolId,
    name: 'Tag',
    icon: <BadgeIcon />,
    aliases: ['Badge', 'Chip'],
    initialValue: () =>
      Model.primitiveElement({
        name: 'Tag',
        componentID: tagSymbolId,
        classNames: Model.classNames(['self-start']),
        children: [Model.string('Tag')],
      }),
  },
  { id: textSymbolId, name: 'Text', icon: <TextIcon />, aliases: ['Label'] },
  { id: textareaSymbolId, name: 'Textarea', icon: <InputIcon /> },
];

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
