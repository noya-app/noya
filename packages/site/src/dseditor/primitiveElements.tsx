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
  icon?: ReactNode;
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
        classNames: ['flex-1', 'bg-primary-50'],
      }),
  },
  {
    id: buttonSymbolId,
    name: 'Button',
    icon: <ButtonIcon />,
    initialValue: () =>
      Model.primitiveElement({
        name: 'Button',
        componentID: buttonSymbolId,
        children: [Model.string('Submit')],
      }),
  },
  { id: checkboxSymbolId, name: 'Checkbox', icon: <CheckboxIcon /> },
  { id: imageSymbolId, name: 'Image', icon: <ImageIcon /> },
  { id: inputSymbolId, name: 'Input', icon: <InputIcon /> },
  { id: linkSymbolId, name: 'Link', icon: <Link1Icon /> },
  { id: radioSymbolId, name: 'Radio', icon: <RadiobuttonIcon /> },
  { id: selectSymbolId, name: 'Select', icon: <DropdownMenuIcon /> },
  { id: switchSymbolId, name: 'Switch', icon: <SwitchIcon /> },
  { id: tableSymbolId, name: 'Table', icon: <TableIcon /> },
  { id: tagSymbolId, name: 'Tag', icon: <BadgeIcon /> },
  { id: textSymbolId, name: 'Text', icon: <TextIcon /> },
  { id: textareaSymbolId, name: 'Textarea', icon: <InputIcon /> },
];

export const PRIMITIVE_ELEMENT_NAMES: Record<string, string> =
  Object.fromEntries(
    primitiveElements.map((element) => [element.id, element.name]),
  );

export const PRIMITIVE_TAG_MAP: Record<string, string> = Object.fromEntries(
  primitiveElements.map((element) => [element.name, element.id]),
);
