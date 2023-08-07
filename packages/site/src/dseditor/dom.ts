import { Point } from 'noya-geometry';

export const ZERO_WIDTH_SPACE = '\u200b';

export function getXPath(
  document: Document,
  element: Node | null | undefined,
): string | undefined {
  if (element === document.body) {
    return '/html/' + (element as HTMLElement).tagName.toLowerCase();
  }

  if (element === null || element === undefined) {
    return undefined;
  }

  if (element.nodeType === Node.TEXT_NODE) {
    // For text nodes, calculate the index among all child nodes (not just elements).
    let index = 0;
    for (let node of (element.parentNode as Node).childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        index++;
      }
      if (node === element) {
        break;
      }
    }

    // Get the path to the parent, then append the text node index.
    const pathToParent = getXPath(document, element.parentNode);

    if (pathToParent === undefined) {
      return undefined;
    }

    return pathToParent + '/text()[' + index + ']';
  } else {
    const parentNode = (element as HTMLElement).parentNode;

    if (!parentNode) {
      debugger;
      return undefined;
    }

    // For element nodes, calculate the index among siblings of the same tag name.
    const siblings = Array.prototype.filter.call(
      parentNode.children,
      (child: HTMLElement) => child.tagName === element.nodeName,
    );
    const index = siblings.indexOf(element as HTMLElement);

    // Get the path to the parent, then append the tag and index of this element.
    const pathToParent = getXPath(document, parentNode);

    if (pathToParent === undefined) {
      return undefined;
    }

    return (
      pathToParent +
      '/' +
      (element as HTMLElement).tagName.toLowerCase() +
      (index !== 0 ? `[${index + 1}]` : '')
    );
  }
}

export function getNodeByXPath(document: Document, xpath: string): Node | null {
  return document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
}

export type SerializedSelection = {
  anchorNode: string;
  anchorOffset: number;
  focusNode: string;
  focusOffset: number;
};

export function serializeSelection(
  window: Window,
  document: Document,
): SerializedSelection | undefined {
  const selection = window.getSelection();

  if (!selection) return;

  const anchorNode = getXPath(document, selection.anchorNode);
  const focusNode = getXPath(document, selection.focusNode);

  if (!anchorNode || !focusNode) return;

  return {
    anchorNode,
    anchorOffset: selection.anchorOffset,
    focusNode,
    focusOffset: selection.focusOffset,
  };
}

export function setDOMSelection(
  window: Window,
  document: Document,
  serializedSelection: SerializedSelection | undefined,
) {
  const selection = window.getSelection();

  if (!serializedSelection || !selection) return;

  const anchorNode = getNodeByXPath(document, serializedSelection.anchorNode);
  const focusNode = getNodeByXPath(document, serializedSelection.focusNode);

  if (!anchorNode || !focusNode) return;

  const range = document.createRange();

  try {
    range.setStart(anchorNode, serializedSelection.anchorOffset);

    selection.removeAllRanges();
    selection.addRange(range);

    // Setting the end of the range before the start of the range doesn't work,
    // so we have to `extend` the selection instead of using `range.setEnd`.
    // https://chat.openai.com/share/cd26a459-319d-402a-9d40-8f8fa789564c
    selection.extend(focusNode, serializedSelection.focusOffset);
  } catch (e) {}
}

export function closest(
  element: HTMLElement | null | undefined,
  predicate: (element: HTMLElement) => boolean,
): HTMLElement | null {
  while (element) {
    if (predicate(element)) return element;

    element = element.parentElement;
  }

  return null;
}

// Helper function to determine the character offset within a text node
export function getCharacterOffset(
  document: Document,
  textNode: Text,
  x: number,
  y: number,
) {
  const range = document.createRange();
  let offset;

  // Iterate through the characters in the text node, creating a range for each
  for (offset = 0; offset < textNode.length; offset++) {
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + 1);
    const rects = range.getClientRects();

    // Check each rectangle (line) for a match
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];

      // Determine the horizontal midpoint of the character
      const midpoint = (rect.left + rect.right) / 2;

      // Check if the x and y coordinates are within the rectangle
      if (y >= rect.top && y <= rect.bottom && x < midpoint) {
        range.detach();
        return offset;
      }
    }
  }

  // Clean up the temporary range
  range.detach();

  return offset;
}

// Helper function to determine the range of the word at a specific position
export function getWordRange(
  document: Document,
  textNode: Text,
  x: number,
  y: number,
) {
  const range = document.createRange();
  const offset = getCharacterOffset(document, textNode, x, y);
  let startOffset = offset;
  let endOffset = offset;

  // Find the start of the word
  while (startOffset > 0 && /\w/.test(textNode.data[startOffset - 1])) {
    startOffset--;
  }

  // Find the end of the word
  while (endOffset < textNode.length && /\w/.test(textNode.data[endOffset])) {
    endOffset++;
  }

  range.setStart(textNode, startOffset);
  range.setEnd(textNode, endOffset);

  return range;
}

export function isTextNode(node: Node): node is Text {
  return node && node.nodeType === Node.TEXT_NODE;
}

export function createSelectionHandlers({
  iframe,
}: {
  iframe: HTMLIFrameElement;
}) {
  const document = iframe.contentDocument;

  let range: Range | null = null;
  let clickCount = 0;
  let clickTimer: number | null = null;
  let initialPosition: Point | null = null;

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!document) return;

    initialPosition = { x: e.clientX, y: e.clientY };

    clickCount++;

    // Clear any existing click timer
    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    // Set a timer to reset the click count after a short delay
    clickTimer = window.setTimeout(function () {
      clickCount = 0;
    }, 400); // 400 milliseconds is a common delay for double/triple-click detection

    range = document.createRange();

    let x = e.clientX - iframe.getBoundingClientRect().left;
    let y = e.clientY - iframe.getBoundingClientRect().top;
    let startElement = document.elementFromPoint(x, y);

    if (!startElement) return;

    const textNode = startElement.childNodes[0];

    if (isTextNode(textNode)) {
      switch (clickCount) {
        case 1: {
          // Single click: set offset based on character
          const offset = getCharacterOffset(document, textNode, x, y);
          range.setStart(textNode, offset);
          range.setEnd(textNode, offset);
          break;
        }
        case 2: {
          // Double click: select the word at the click location
          const wordRange = getWordRange(document, textNode, x, y);
          if (wordRange) {
            range = wordRange;
          }
          break;
        }
        // 3 or more
        default: {
          // Triple click: select the entire text content
          range.setStart(textNode, 0);
          range.setEnd(textNode, textNode.length);
          break;
        }
      }
    } else {
      range.setStart(startElement, 0);
      range.setEnd(startElement, 0);
    }

    // Focus the element within the iframe
    if ('focus' in startElement && typeof startElement.focus === 'function') {
      startElement.focus();
    }

    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  function isMoving(point: Point, origin: Point): boolean {
    const threshold = 3;

    return (
      Math.abs(point.x - origin.x) > threshold ||
      Math.abs(point.y - origin.y) > threshold
    );
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!document) return;

    if (
      !initialPosition ||
      !isMoving({ x: e.clientX, y: e.clientY }, initialPosition)
    ) {
      return;
    }

    if (!range) return;

    const x = e.clientX - iframe.getBoundingClientRect().left;
    const y = e.clientY - iframe.getBoundingClientRect().top;
    const endElement = document.elementFromPoint(x, y);

    if (!endElement) return;

    const textNode = endElement.childNodes[0];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const offset = getCharacterOffset(document, textNode as Text, x, y);
      range.setEnd(textNode, offset);
    } else {
      try {
        range.setEnd(endElement, endElement.childNodes.length);
      } catch (error) {
        // Handle cases where the endElement is not a valid end point for the range
      }
    }

    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    initialPosition = null;
  };

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  };
}
