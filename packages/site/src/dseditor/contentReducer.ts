import { normalizeRange, updateTextSpan } from 'noya-state';
import { ZERO_WIDTH_SPACE } from './dom';

type State = {
  string: string;
  range: [number, number];
};

type Action = {
  insertText?: string | null;
  range: [number, number];
};

export function contentReducer(
  string: string | null | undefined,
  action: Action,
): State {
  string = (string ?? '').replace(ZERO_WIDTH_SPACE, '');
  const insertText = (action.insertText ?? '').replace(ZERO_WIDTH_SPACE, '');
  const normalizedRange = normalizeRange(action.range);
  const newSpan = updateTextSpan(
    { string, location: 0, length: string.length },
    normalizedRange,
    insertText,
    true,
  );

  const newOffset = normalizedRange[0] + insertText.length;

  return {
    string: newSpan.string,
    range: [newOffset, newOffset],
  };
}
