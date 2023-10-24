// https://chat.openai.com/share/8f531826-979b-4c23-b3f6-768715b152a4
import ts from 'typescript';

export interface LayoutNode {
  tag: string;
  attributes: {
    name?: string;
    class?: string;
    alt?: string;
    placeholder?: string;
    style?: Record<string, string>;
  };
  // attributes: { [name: string]: string | Record<string, string> };
  children: (LayoutNode | string)[];
}

export type LayoutNodeAttributes = LayoutNode['attributes'];

function extractObjectLiteralProperties(
  node: ts.ObjectLiteralExpression,
): Record<string, string> {
  const properties: Record<string, string> = {};
  node.properties.forEach((property) => {
    if (
      ts.isPropertyAssignment(property) &&
      (ts.isStringLiteral(property.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(property.initializer))
    ) {
      properties[property.name.getText()] = property.initializer.text;
    }
  });
  return properties;
}

function convertJsxElementToLayoutNode(
  node: ts.Node,
): LayoutNode | string | null {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    // This node represents a JSX element or a self-closing JSX element. Convert it to a LayoutNode.
    const openingElement = ts.isJsxElement(node) ? node.openingElement : node;
    const tag = openingElement.tagName.getText();
    const attributes: LayoutNodeAttributes = {};

    // eslint-disable-next-line @shopify/prefer-early-return
    openingElement.attributes.forEachChild((attribute) => {
      if (ts.isJsxAttribute(attribute) && attribute.initializer) {
        let name = attribute.name.text;

        // convert className to class
        if (name === 'className') {
          name = 'class';
        }

        if (ts.isStringLiteral(attribute.initializer)) {
          attributes[name as 'name'] = attribute.initializer.text;
        } else if (
          ts.isJsxExpression(attribute.initializer) &&
          attribute.initializer.expression &&
          ts.isObjectLiteralExpression(attribute.initializer.expression)
        ) {
          attributes[name as 'style'] = extractObjectLiteralProperties(
            attribute.initializer.expression,
          );
        }
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

const extractCodeBlock = (str: string) => {
  // Regex pattern explanation:
  // ```(?:[a-zA-Z]+\n)? - Match the starting three backticks, optionally followed by a language specifier and a newline.
  // ([\s\S]*?) - Capture everything following the specifier in a non-greedy way until the ending backticks or the end of the string.
  // (?:```|$) - Non-capturing group for the ending three backticks or the end of the string.
  const pattern = /```(?:[a-zA-Z]+\n)?([\s\S]*?)(?:```|$)/;
  const match = str.match(pattern);

  return match ? match[1] : null; // If there's a match, return the first captured group (the code block content).
};

export function parseComponentLayout(source: string): LayoutNode {
  source = extractCodeBlock(source) ?? source;

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
