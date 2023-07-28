// https://chat.openai.com/share/8f531826-979b-4c23-b3f6-768715b152a4
import ts from 'typescript';

export interface LayoutNode {
  tag: string;
  attributes: { [name: string]: string };
  children: (LayoutNode | string)[];
}

function convertJsxElementToLayoutNode(
  node: ts.Node,
): LayoutNode | string | null {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    // This node represents a JSX element or a self-closing JSX element. Convert it to a LayoutNode.
    const openingElement = ts.isJsxElement(node) ? node.openingElement : node;
    const tag = openingElement.tagName.getText();
    const attributes: { [name: string]: string } = {};
    openingElement.attributes.forEachChild((attribute) => {
      if (
        ts.isJsxAttribute(attribute) &&
        attribute.initializer &&
        ts.isStringLiteral(attribute.initializer)
      ) {
        attributes[attribute.name.text] = attribute.initializer.text;
      }
    });
    const children: (LayoutNode | string)[] = [];
    if (ts.isJsxElement(node)) {
      ts.forEachChild(node, (child) => {
        const childNode = convertJsxElementToLayoutNode(child);
        if (childNode) {
          children.push(childNode);
        }
      });
    }
    return { tag, attributes, children };
  } else if (ts.isJsxText(node)) {
    // This node represents text inside a JSX element. Convert it to a string.
    return node.text.trim();
  }
  // This node is something else (e.g. whitespace). Ignore it.
  return null;
}

function findFirstJsxElement(
  node: ts.Node,
): ts.JsxElement | ts.JsxSelfClosingElement | null {
  let result: ts.JsxElement | ts.JsxSelfClosingElement | null = null;
  ts.forEachChild(node, (child) => {
    if (result === null) {
      if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
        result = child;
      } else {
        result = findFirstJsxElement(child);
      }
    }
  });
  return result;
}

export function parseComponentLayout(source: string): LayoutNode {
  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    source,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX,
  );
  const firstJsxElement = findFirstJsxElement(sourceFile);
  if (firstJsxElement === null) {
    throw new Error('Source does not contain a JSX element');
  }
  const layoutNode = convertJsxElementToLayoutNode(firstJsxElement);
  if (typeof layoutNode === 'string' || layoutNode === null) {
    throw new Error(
      'First JSX element in source does not contain any children',
    );
  }
  return layoutNode;
}
