import { BlockDefinition } from 'noya-state';
import { BaseEditor, Descendant } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

export type ParagraphElement = {
  type: 'paragraph';
  label?: string;
  children: Descendant[];
};

export type CustomElement = ParagraphElement;

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    blockDefinition: BlockDefinition;
  };

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
  }
}
