import { memoize } from '@noya-app/noya-utils';
import React, { ReactElement } from 'react';

interface SVGComponentProps {
  node: Element;
}

const SVGComponent = ({ node }: SVGComponentProps): ReactElement | null => {
  if (!node) return null;

  const nodeName = node.nodeName;
  const childNodes = Array.from(node.children);

  // Convert attributes to props
  const props: { [key: string]: string } = Array.from(node.attributes).reduce(
    (acc, attr) => {
      // Convert attribute names to camelCase
      const name = attr.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      acc[name] = attr.value;
      return acc;
    },
    {} as { [key: string]: string },
  );

  // Recursively handle child nodes
  const childrenArray = childNodes.map((childNode) =>
    SVGComponent({ node: childNode }),
  );

  // Handle the 'svg' root node separately to attach necessary namespaces
  if (nodeName === 'svg') {
    return React.createElement(
      'svg',
      { ...props, xmlns: 'http://www.w3.org/2000/svg', version: '1.1' },
      ...childrenArray,
    );
  }

  // Render other SVG elements
  return React.createElement(nodeName, props, ...childrenArray);
};

export const svgToReactElement = memoize(function svgToReactElement(
  svgString: string,
): React.ReactElement | null {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgNode = xmlDoc.children[0];

  return SVGComponent({ node: svgNode });
});
