import { BaseEditor, Descendant } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

/**
 * In general, the fewer things we need in here the better, since it can be
 * tricky to sync editor state with the rest of the app.
 */
export type ParagraphElement = {
  type: 'paragraph';
  label?: string;
  placeholder?: string;
  symbolId: string;
  children: Descendant[];
  layerId?: string;
};

export type CustomElement = ParagraphElement;

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    symbolId: string;
  };

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
  }
}
