import * as tsvfs from '@typescript/vfs';
import lzstring from 'lz-string';
import { withOptions } from 'tree-visit';
import ts, {
  Expression,
  JsxOpeningElement,
  JsxSelfClosingElement,
  SyntaxKind,
} from 'typescript';
import { firstChild, firstChildOfKind, isKind, Nodes } from './traversal';

export const compilerOptions: ts.CompilerOptions = {
  jsx: ts.JsxEmit.Preserve,
};

export type ElementAttributeValue =
  | {
      type: 'stringLiteral';
      value: string;
    }
  | {
      type: 'other';
      value: ts.Node;
    };

export type ElementLayer = {
  id: string;
  tagName: string;
  children: ElementLayer[];
  attributes: Record<string, ElementAttributeValue>;
};

export const ElementTree = withOptions({
  getChildren: (element: ElementLayer) => element.children,
});

function getLayerHierarchy(
  expression: Expression,
  id: string,
): ElementLayer | undefined {
  const jsxElement = Nodes.find(expression, isKind(SyntaxKind.JsxElement));

  if (!jsxElement) return;

  const tagElement = firstChild(
    expression,
    (child): child is JsxOpeningElement | JsxSelfClosingElement =>
      child.kind === SyntaxKind.JsxOpeningElement ||
      child.kind === SyntaxKind.JsxSelfClosingElement,
  );

  if (!tagElement) return undefined;

  let children: ElementLayer[] = [];

  if (isKind(SyntaxKind.JsxOpeningElement)(tagElement)) {
    const content = expression.getChildren()[1].getChildren()[1];

    // console.log(Nodes.diagram(expression));

    if (content && isKind(SyntaxKind.SyntaxList)(content)) {
      children = content
        .getChildren()
        .flatMap(
          (item, index) =>
            getLayerHierarchy(item as any, `${id}:${index}`) ?? [],
        );
    }
  }

  const jsxAttributes = Nodes.findAll(
    tagElement,
    isKind(SyntaxKind.JsxAttribute),
  );

  const attributes = Object.fromEntries(
    jsxAttributes.flatMap((attribute) => {
      const expression = Nodes.find(
        attribute,
        isKind(SyntaxKind.JsxExpression),
      );

      if (!expression) return [];

      const key = attribute.name.getText();
      let value: ElementAttributeValue = { type: 'other', value: expression };

      const stringLiteral = Nodes.find(
        expression,
        isKind(SyntaxKind.StringLiteral),
      );

      if (stringLiteral) {
        value = { type: 'stringLiteral', value: stringLiteral.text };
      }

      return [[key, value]];
    }),
  );

  // console.log(Nodes.diagram(tagElement));

  return {
    id,
    tagName: tagElement.tagName.getText(),
    children,
    attributes,
  };
}

export async function createBaseFileSystem(): Promise<Map<string, string>> {
  return await tsvfs.createDefaultMapFromCDN(
    compilerOptions,
    ts.version,
    true,
    ts,
    lzstring,
  );
}

export type TypescriptEnvironment = {
  environment: tsvfs.VirtualTypeScriptEnvironment;
  fileSystem: Map<string, string>;
};

export function createTypescriptEnvironment(
  baseFileSystem: Map<string, string>,
): TypescriptEnvironment {
  const fileSystem = new Map(baseFileSystem);

  const system = tsvfs.createSystem(fileSystem);

  const env = tsvfs.createVirtualTypeScriptEnvironment(
    system,
    [],
    ts,
    compilerOptions,
  );

  return {
    environment: env,
    fileSystem,
    // host: tsvfs.createVirtualCompilerHost(system, compilerOptions, ts),
  };
}

export function getComponentInfo(
  sourceFile: ts.SourceFile,
  id: string,
): ElementLayer | undefined {
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
      return getLayerHierarchy(returnStatement.expression, `${id}:0`);
    }
  }
}
