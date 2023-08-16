import { useDeepState } from 'noya-react-utils';
import { normalizeRange } from 'noya-state';
import React, { ComponentProps, forwardRef, useCallback } from 'react';
import { DSRenderProps, DSRenderer, IDSRenderer } from './DSRenderer';
import { contentReducer } from './contentReducer';
import { SerializedSelection, closest } from './dom';

type Props = Pick<
  ComponentProps<typeof DSRenderer>,
  'primary' | 'sourceName' | 'renderContent' | 'setHighlightedPath'
> & {
  onChangeTextAtPath?: (args: { path: string[]; value: string }) => void;
  getStringValueAtPath: (path: string[]) => string | undefined;
};

export const DSControlledRenderer = forwardRef(function DSControlledRenderer(
  {
    renderContent,
    setHighlightedPath,
    onChangeTextAtPath,
    getStringValueAtPath,
    ...rest
  }: Props,
  forwardedRef: React.ForwardedRef<IDSRenderer>,
) {
  const [serializedSelection, setSerializedSelection] = useDeepState<
    SerializedSelection | undefined
  >();

  const onBeforeInput = useCallback(
    (event: InputEvent) => {
      event.preventDefault();

      const ranges = event.getTargetRanges();
      const range = ranges[0];

      if (!range || !range.startContainer.isSameNode(range.endContainer)) {
        return;
      }

      const path = findStringElementPath(range.startContainer.parentElement);

      if (!path) return;

      const content = contentReducer(range.startContainer.textContent, {
        insertText: event.data,
        range: [range.startOffset, range.endOffset],
      });

      onChangeTextAtPath?.({ path, value: content.string });

      if (serializedSelection) {
        setSerializedSelection({
          ...serializedSelection,
          anchorOffset: content.range[0],
          focusOffset: content.range[1],
        });
      }
    },
    [onChangeTextAtPath, serializedSelection, setSerializedSelection],
  );

  const handleRenderContent = useCallback(
    (props: DSRenderProps) => {
      const content = renderContent(props);

      return (
        <div
          style={{
            flex: 1,
            minHeight: '100%',
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
          }}
          onKeyDownCapture={(event) => {
            const target = event.target as HTMLElement;

            // Handle space manually
            if (event.key === ' ') {
              // Prevent ' ' from getting inserted automatically and triggering beforeinput.
              // Also prevent triggering buttons.
              event.preventDefault();

              const path = findStringElementPath(target);

              if (!path) return;

              const string = getStringValueAtPath(path);

              if (string === undefined) return;

              const content = contentReducer(string, {
                insertText: ' ',
                range: normalizeRange([
                  serializedSelection?.anchorOffset ?? 0,
                  serializedSelection?.focusOffset ?? 0,
                ]),
              });

              onChangeTextAtPath?.({ path, value: content.string });

              if (serializedSelection) {
                setSerializedSelection({
                  ...serializedSelection,
                  anchorOffset: content.range[0],
                  focusOffset: content.range[1],
                });
              }
            }
          }}
        >
          {content}
        </div>
      );
    },
    [
      getStringValueAtPath,
      onChangeTextAtPath,
      renderContent,
      serializedSelection,
      setSerializedSelection,
    ],
  );

  return (
    <DSRenderer
      ref={forwardedRef}
      serializedSelection={serializedSelection}
      setSerializedSelection={setSerializedSelection}
      setHighlightedPath={setHighlightedPath}
      onBeforeInput={onBeforeInput}
      renderContent={handleRenderContent}
      {...rest}
    />
  );
});

export function findStringElementPath(element: HTMLElement | null) {
  const parent = closest(
    element,
    (element) => !!('dataset' in element && element.dataset.stringpath),
  );

  return parent?.dataset.stringpath?.split('/');
}
