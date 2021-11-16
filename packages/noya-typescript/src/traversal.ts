import ts, { SyntaxKind } from 'typescript';
import { withOptions } from 'tree-visit';

export function getChildren(node: ts.Node) {
  const children: ts.Node[] = [];

  ts.forEachChild(node, (child) => {
    children.push(child);
  });

  return children;
}

const functions = withOptions<ts.Node>({ getChildren });

export const Nodes = {
  find<T extends ts.Node>(
    node: ts.Node,
    predicate: (node: ts.Node) => node is T,
  ) {
    return functions.find(node, predicate) as T | undefined;
  },

  findIndexPath: functions.findIndexPath,

  findAll<T extends ts.Node>(
    node: ts.Node,
    predicate: (node: ts.Node) => node is T,
  ) {
    return functions.findAll(node, predicate) as T[];
  },

  diagram(node: ts.Node) {
    return functions.diagram(node, {
      flattenSingleChildNodes: false,
      getLabel: (node) => SyntaxKind[node.kind],
      getChildren,
    });
  },
};

export type SyntaxKindMap = Record<ts.SyntaxKind, ts.Node> & {
  [ts.SyntaxKind.FunctionDeclaration]: ts.FunctionDeclaration;
  [ts.SyntaxKind.ReturnStatement]: ts.ReturnStatement;
  [ts.SyntaxKind.JsxElement]: ts.JsxElement;
  [ts.SyntaxKind.JsxOpeningElement]: ts.JsxOpeningElement;
  [ts.SyntaxKind.JsxSelfClosingElement]: ts.JsxSelfClosingElement;
  [ts.SyntaxKind.JsxAttribute]: ts.JsxAttribute;
  [ts.SyntaxKind.JsxAttributes]: ts.JsxAttributes;
  [ts.SyntaxKind.Identifier]: ts.Identifier;
  [ts.SyntaxKind.JsxExpression]: ts.JsxExpression;
  [ts.SyntaxKind.StringLiteral]: ts.StringLiteral;
};

export function traverse<T>(
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

export function firstChild<T extends ts.Node>(
  node: ts.Node,
  predicate: (child: ts.Node) => child is T,
): T | undefined {
  return traverse(node, (child) => {
    if (predicate(child)) return child;
  }) as T | undefined;
}

export function kindName(node: ts.Node) {
  return SyntaxKind[node.kind];
}

export function isKind<T extends ts.SyntaxKind>(
  kind: T,
): (node: ts.Node) => node is SyntaxKindMap[T] {
  return (node): node is SyntaxKindMap[T] => node.kind === kind;
}

export function firstChildOfKind<T extends ts.SyntaxKind>(
  node: ts.Node,
  kind: T,
): SyntaxKindMap[T] | undefined {
  return firstChild(
    node,
    (child): child is SyntaxKindMap[T] => child.kind === kind,
  );
}

export function transformNode<T extends ts.Node>(
  node: T,
  transform: (
    node: ts.Node,
    indexPath: number[],
    nodePath: ts.Node[],
  ) => ts.Node,
): T {
  const transformerFactory: ts.TransformerFactory<ts.Node> =
    (context) => (rootNode) => {
      let indexPath: number[] = [];
      let nodePath: ts.Node[] = [];

      function visit(node: ts.Node): ts.Node {
        node = transform(node, indexPath, nodePath);

        let childIndex = 0;

        let result = ts.visitEachChild(
          node,
          (child) => {
            indexPath.push(childIndex);
            nodePath.push(node);

            child = visit(child);

            nodePath.pop();
            indexPath.pop();

            childIndex++;

            return child;
          },
          context,
        );

        return result;
      }

      return ts.visitNode(rootNode, visit);
    };

  return ts.transform(node, [transformerFactory]).transformed[0] as T;
}
