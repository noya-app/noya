import { ReactEventHandlers } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  AddLayerOptions,
  handleActionType,
  InteractionState,
} from 'noya-state';
import { ClipboardUtils } from 'noya-utils';
import { NoyaClipboardData } from '../hooks/useCopyHandler';
import { InteractionAPI } from './types';

export interface ClipboardActions {
  addLayer: (layers: Sketch.AnyLayer[], options?: AddLayerOptions) => void;
}

type MenuItemType = 'copy' | 'paste';

export function clipboardInteraction({ addLayer }: ClipboardActions) {
  return handleActionType<
    InteractionState,
    [InteractionAPI],
    ReactEventHandlers<MenuItemType>
  >({
    none: (interactionState, api) => ({
      onContributeMenuItems: () => {
        return [
          api.selectedLayerIds.length > 0 && {
            value: 'copy',
            title: 'Copy',
            shortcut: 'mod-C',
          },
          { value: 'paste', title: 'Paste', shortcut: 'mod-V' },
        ];
      },
      onSelectMenuItem: (id) => {
        switch (id) {
          case 'copy':
            const isSafari = /Apple Computer/.test(navigator.vendor);

            if (isSafari) {
              const range = document.createRange();
              range.selectNode(document.body);

              window.getSelection()?.removeAllRanges();
              window.getSelection()?.addRange(range);
            }

            document.execCommand('copy');

            if (isSafari) {
              window.getSelection()?.removeAllRanges();
            }

            break;
          case 'paste':
            // Works on safari
            document.execCommand('paste');

            const paste = async () => {
              try {
                const clipboardItems = await navigator.clipboard.read();

                for (const clipboardItem of clipboardItems) {
                  const blob = await clipboardItem.getType('text/html');
                  const blobText = await blob.text();

                  if (!blobText) return;

                  const data: NoyaClipboardData | undefined =
                    ClipboardUtils.fromEncodedHTML(blobText);

                  if (!data) return;

                  addLayer(data.layers);
                }
              } catch (e) {
                console.warn('Failed to paste');
              }
            };

            paste();

            break;
        }
      },
    }),
  });
}
