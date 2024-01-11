import prettier from 'prettier';
import prettierCSS from 'prettier/parser-postcss';
import prettierTypeScript from 'prettier/parser-typescript';
import ts from 'typescript';

export function print(nodes: ts.Node | ts.Node[]) {
  const sourceFile = ts.createSourceFile(
    'App.tsx',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const printer = ts.createPrinter();

  const source = Array.isArray(nodes)
    ? printer.printList(
        ts.ListFormat.MultiLine,
        ts.factory.createNodeArray(nodes),
        sourceFile,
      )
    : printer.printNode(ts.EmitHint.Unspecified, nodes, sourceFile);

  return source;
}

export function format(text: string) {
  return prettier.format(text, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    proseWrap: 'always',
    parser: 'typescript',
    plugins: [prettierTypeScript],
  });
}

// The HTML parser outputs with strange newlines, so instead we use the TS printer
// and clean it up a bit
export function formatHTML(text: string) {
  let out = format(text);
  out = out.trim();
  if (out.endsWith(';')) {
    out = out.slice(0, -1);
  }
  return out;
}

export function formatCSS(text: string) {
  return prettier.format(text, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    proseWrap: 'always',
    parser: 'css',
    plugins: [prettierCSS],
  });
}
