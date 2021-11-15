import ts, {
  Expression,
  JsxOpeningElement,
  JsxSelfClosingElement,
  SyntaxKind,
} from 'typescript';
import * as tsvfs from '@typescript/vfs';
import lzstring from 'lz-string';

const compilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,
};

type SyntaxKindMap = Record<ts.SyntaxKind, ts.Node> & {
  [ts.SyntaxKind.FunctionDeclaration]: ts.FunctionDeclaration;
  [ts.SyntaxKind.ReturnStatement]: ts.ReturnStatement;
  [ts.SyntaxKind.JsxElement]: ts.JsxElement;
  [ts.SyntaxKind.JsxOpeningElement]: ts.JsxOpeningElement;
  [ts.SyntaxKind.JsxSelfClosingElement]: ts.JsxSelfClosingElement;
};

function traverse<T>(
  node: ts.Node,
  visit: (node: ts.Node) => T,
): T | undefined {
  return ts.forEachChild(node, (child) => {
    let result = visit(child);

    if (result) {
      return result;
    }

    return traverse(child, visit);
  }) as T | undefined;
}

function firstChild<T extends ts.Node>(
  node: ts.Node,
  predicate: (child: ts.Node) => child is T,
): T | undefined {
  return traverse(node, (child) => {
    if (predicate(child)) return child;
  }) as T | undefined;
}

// function isKind<T extends ts.SyntaxKind>(
//   node: ts.Node,
//   kind: T,
// ): node is SyntaxKindMap[T] {
//   return node.kind === kind;
// }

function firstChildOfKind<T extends ts.SyntaxKind>(
  node: ts.Node,
  kind: T,
): SyntaxKindMap[T] | undefined {
  return firstChild(
    node,
    (child): child is SyntaxKindMap[T] => child.kind === kind,
  );
}

export type ComponentLayer = {
  tagName: string;
  children: ComponentLayer[];
};

function getLayerHierarchy(expression: Expression): ComponentLayer | undefined {
  if (expression.kind !== SyntaxKind.JsxElement) return;

  const tagElement = firstChild(
    expression,
    (child): child is JsxOpeningElement | JsxSelfClosingElement =>
      child.kind === SyntaxKind.JsxOpeningElement ||
      child.kind === SyntaxKind.JsxSelfClosingElement,
  );

  if (!tagElement) return undefined;

  let children: ComponentLayer[] = [];

  // if (isKind(tagElement, SyntaxKind.JsxOpeningElement)) {
  // console.log(JSON.stringify(expression));
  //   const content = expression.getChildren()[1].getChildren();

  //   children = content.flatMap((item) => getLayerHierarchy(item as any) ?? []);

  //   // console.log({ content, children });
  // }

  return {
    tagName:
      (tagElement.tagName as ts.Identifier).escapedText ?? 'Non-identifier',
    // tagName: tagElement.tagName.getText(),
    children,
  };
}

let baseMap: Map<string, string>;

async function setup() {
  if (baseMap === undefined) {
    baseMap = await tsvfs.createDefaultMapFromCDN(
      compilerOptions,
      ts.version,
      true,
      ts,
      lzstring,
    );
  }
}

export async function compileTypescriptFile(
  source: string,
): Promise<ts.SourceFile> {
  await setup();

  const fsMap = new Map(baseMap);

  fsMap.set('index.tsx', source);

  const system = tsvfs.createSystem(fsMap);

  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });

  // program.emit();

  // Now I can look at the AST for the .ts file too
  const index = program.getSourceFile('index.tsx')!;

  return index;
}

export function getComponentInfo(
  sourceFile: ts.SourceFile,
): ComponentLayer | undefined {
  const functionDeclaration = firstChildOfKind(
    sourceFile,
    ts.SyntaxKind.FunctionDeclaration,
  );

  if (functionDeclaration) {
    const returnStatement = firstChildOfKind(
      functionDeclaration,
      ts.SyntaxKind.ReturnStatement,
    );

    if (returnStatement && returnStatement.expression) {
      return getLayerHierarchy(returnStatement.expression);
    }
  }
}

export async function testTypescript() {
  await setup();

  const fsMap = new Map(baseMap);

  fsMap.set(
    'index.tsx',
    `function Test() {
  return <View><Text></Text></View>;
}`,
  );
  // fsMap.set('index.ts', '// main TypeScript file content');

  // console.log([...fsMap.keys()]);

  const system = tsvfs.createSystem(fsMap);
  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });

  // This will update the fsMap with new files
  // for the .d.ts and .js files
  program.emit();

  // Now I can look at the AST for the .ts file too
  const index = program.getSourceFile('index.tsx');

  if (index) {
    const functionDeclaration = firstChildOfKind(
      index,
      ts.SyntaxKind.FunctionDeclaration,
    );

    // console.log({ functionDeclaration });

    if (functionDeclaration) {
      const returnStatement = firstChildOfKind(
        functionDeclaration,
        ts.SyntaxKind.ReturnStatement,
      );

      if (returnStatement) {
        const tagName = getLayerHierarchy(returnStatement.expression!);

        console.info(tagName);
      }
    }
  }

  // console.log([...fsMap.keys()]);
}
