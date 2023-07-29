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
    // For element nodes, calculate the index among siblings of the same tag name.
    const siblings = Array.prototype.filter.call(
      (element as HTMLElement).parentNode!.children,
      (child: HTMLElement) => child.tagName === element.nodeName,
    );
    const index = siblings.indexOf(element as HTMLElement);

    // Get the path to the parent, then append the tag and index of this element.
    const pathToParent = getXPath(
      document,
      (element as HTMLElement).parentNode,
    );

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
