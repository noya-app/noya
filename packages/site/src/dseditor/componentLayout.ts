import { LayoutNode } from 'noya-compiler';
import { withOptions } from 'tree-visit';
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
import { NoyaElement, NoyaNode } from './types';

export const LayoutHierarchy = withOptions<LayoutNode | string>({
  getChildren: (node) => (typeof node === 'string' ? [] : node.children),
});

const PRIMITIVE_TAG_MAP: Record<string, string> = {
  Avatar: avatarSymbolId,
  Box: boxSymbolId,
  Button: buttonSymbolId,
  Checkbox: checkboxSymbolId,
  Image: imageSymbolId,
  Input: inputSymbolId,
  Link: linkSymbolId,
  Radio: radioSymbolId,
  Select: selectSymbolId,
  Switch: switchSymbolId,
  Table: tableSymbolId,
  Tag: tagSymbolId,
  Text: textSymbolId,
  TextArea: textareaSymbolId,
};

export function convertLayoutToComponent(layout: LayoutNode): NoyaElement {
  const result = LayoutHierarchy.map<NoyaNode>(
    layout,
    (node, transformedChildren) => {
      if (typeof node === 'string') {
        return Model.string({ value: node });
      }

      const result: NoyaNode = Model.primitiveElement({
        componentID: PRIMITIVE_TAG_MAP[node.tag],
        children: transformedChildren,
        classNames: node.attributes.class?.split(' '),
      });

      return result;
    },
  );

  if (result.type !== 'noyaPrimitiveElement') {
    throw new Error('Expected primitive element at root of layout');
  }

  return result;
}
