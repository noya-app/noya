import ts from 'typescript';
import { removeEmptyClassNames } from './passes/removeEmptyClassNames';
import { removeEmptyStyles } from './passes/removeEmptyStyles';
import { removeUndefinedStyles } from './passes/removeUndefinedStyles';
import { format, print } from './print';

export function clean(text: string) {
  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    text,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const updated = removeEmptyClassNames(
    removeEmptyStyles(removeUndefinedStyles(sourceFile)),
  );

  return format(print(updated));
}
