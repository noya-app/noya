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
    // eslint-disable-next-line @shopify/prefer-early-return
    openingElement.attributes.forEachChild((attribute) => {
      if (
        ts.isJsxAttribute(attribute) &&
        attribute.initializer &&
        ts.isStringLiteral(attribute.initializer)
      ) {
        let name = attribute.name.text;

        // convert className to class
        if (name === 'className') {
          name = 'class';
        }

        attributes[name] = attribute.initializer.text;
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
  // The target source may be in a ```lang...``` code block. If so, extract the source from the code block.
  const codeBlockMatch = source.match(/```.*\n([\s\S]*)\n```/);

  if (codeBlockMatch) {
    source = codeBlockMatch[1];
  }

  // Replace html-style comments "<!-- ... -->" with an empty string.
  source = source.replace(/<!--.*?-->/gs, '');

  // Replace data attributes "[data-...]" with an empty string.
  // This isn't valid HTML but can appear in GPT3.5 output.
  // E.g. <div name="foo" [data-tab-active="Tab 1"]>
  source = source.replace(/\[data-.*?\]/gs, '');

  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    source,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TSX,
  );
  const firstJsxElement = findFirstJsxElement(sourceFile);
  if (firstJsxElement === null) {
    // throw new Error('Source does not contain a JSX element');
    return { tag: 'Box', attributes: {}, children: [] };
  }
  const layoutNode = convertJsxElementToLayoutNode(firstJsxElement);
  if (typeof layoutNode === 'string' || layoutNode === null) {
    // throw new Error(
    //   'First JSX element in source does not contain any children',
    // );
    return { tag: 'Box', attributes: {}, children: [] };
  }
  return layoutNode;
}
