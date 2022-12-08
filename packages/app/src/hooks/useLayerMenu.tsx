import { useDispatch, useWorkspace } from 'noya-app-state-context';
import {
  createSectionedMenu,
  MenuConfig,
  MenuItem,
  RegularMenuItem,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { useShallowArray } from 'noya-react-utils';
import { InteractionType, Layers, Selectors } from 'noya-state';
import { ClipboardUtils } from 'noya-utils';
import { useCallback, useMemo } from 'react';
import { useOpenInputDialog } from '../contexts/DialogContext';

function isValidClippingMaskType(type: Sketch.AnyLayer['_class']): boolean {
  switch (type) {
    case 'bitmap':
    case 'oval':
    case 'polygon':
    case 'rectangle':
    case 'shapeGroup':
    case 'shapePath':
    case 'star':
    case 'triangle':
      return true;
    case 'page':
    case 'artboard':
    case 'group':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolInstance':
    case 'symbolMaster':
    case 'text':
      return false;
  }
}

function isValidMaskChainBreakerType(type: Sketch.AnyLayer['_class']): boolean {
  switch (type) {
    case 'bitmap':
    case 'group':
    case 'oval':
    case 'polygon':
    case 'rectangle':
    case 'shapeGroup':
    case 'shapePath':
    case 'star':
    case 'symbolInstance':
    case 'text':
    case 'triangle':
      return true;
    case 'page':
    case 'artboard':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolMaster':
      return false;
  }
}

export type LayerMenuItemType =
  | 'selectAll'
  | 'duplicate'
  | 'rename'
  | 'group'
  | 'ungroup'
  | 'delete'
  | 'copy'
  | 'paste'
  | 'createSymbol'
  | 'detachSymbol'
  | 'useAsMask'
  | 'ignoreMasks'
  | 'isAlphaMask'
  | 'lock'
  | 'unlock'
  | 'hide'
  | 'show';

export default function useLayerMenu(
  layers: Sketch.AnyLayer[],
  interactionType: InteractionType,
) {
  const dispatch = useDispatch();
  const openDialog = useOpenInputDialog();
  const { startRenamingLayer } = useWorkspace();

  const isEditingText = Selectors.getIsEditingText(interactionType);

  const hasSelectedLayers = layers.length > 0;

  const canUngroup = layers.length === 1 && Layers.isGroup(layers[0]);

  const canDetach = layers.length === 1 && Layers.isSymbolInstance(layers[0]);

  const canBeMask = layers.every((layer) =>
    isValidClippingMaskType(layer._class),
  );

  const canBeMaskChainBreaker = layers.every((layer) =>
    isValidMaskChainBreakerType(layer._class),
  );

  const canBeSymbol = useMemo(() => {
    return (
      layers.length >= 1 &&
      !layers.some(Layers.isSymbolMaster) &&
      (layers.every(Layers.isArtboard) ||
        layers.every((item) => !Layers.isArtboard(item)))
    );
  }, [layers]);

  const newUseAsMaskValue = !layers.every((item) => item.hasClippingMask);

  const newIsAlphaMaskValue = !layers.every(
    (item) => item.clippingMaskMode === 1,
  );

  const newIgnoreMasksValue = !layers.every(
    (item) => item.shouldBreakMaskChain,
  );

  const canUnlock = layers.some((layer) => layer.isLocked);

  const canShow = layers.some((item) => !item.isVisible);

  const menuConfig: MenuConfig<LayerMenuItemType> = useMemo(() => {
    const selectAllSection: RegularMenuItem<LayerMenuItemType>[] = [
      { value: 'selectAll', title: 'Select All', shortcut: 'Mod-a' },
    ];

    if (!hasSelectedLayers) return [selectAllSection];

    return [
      [
        canBeSymbol && {
          value: 'createSymbol',
          title: 'Create Symbol',
        },
        canDetach && {
          value: 'detachSymbol',
          title: 'Detach Symbol',
        },
      ],
      [
        { value: 'rename', title: 'Rename' },
        { value: 'group', title: 'Group', shortcut: 'Mod-g' },
        canUngroup && {
          value: 'ungroup',
          title: 'Ungroup',
          shortcut: 'Mod-Shift-g',
        },
      ],
      [{ value: 'duplicate', title: 'Duplicate', shortcut: 'Mod-d' }],
      [{ value: 'delete', title: 'Delete' }],

      [{ value: 'copy', title: 'Copy' }],
      [
        canUnlock
          ? { value: 'unlock', title: 'Unlock', shortcut: 'Mod-Shift-l' }
          : { value: 'lock', title: 'Lock', shortcut: 'Mod-Shift-l' },
        canShow
          ? { value: 'show', title: 'Show', shortcut: 'Mod-Shift-h' }
          : { value: 'hide', title: 'Hide', shortcut: 'Mod-Shift-h' },
      ],
      [
        canBeMask && {
          value: 'useAsMask',
          title: 'Use as mask',
          checked: !newUseAsMaskValue,
        },
        canBeMask && {
          value: 'isAlphaMask',
          title: 'Mask using alpha',
          checked: !newIsAlphaMaskValue,
        },
        canBeMaskChainBreaker && {
          value: 'ignoreMasks',
          title: 'Ignore masks',
          checked: !newIgnoreMasksValue,
        },
      ],
      selectAllSection,
    ];
  }, [
    canBeMask,
    canBeMaskChainBreaker,
    canBeSymbol,
    canDetach,
    canShow,
    canUngroup,
    canUnlock,
    hasSelectedLayers,
    newIgnoreMasksValue,
    newIsAlphaMaskValue,
    newUseAsMaskValue,
  ]);

  const menuItems: MenuItem<LayerMenuItemType>[] = useMemo(
    () => createSectionedMenu(...menuConfig),
    [menuConfig],
  );

  const selectedLayerIds = useShallowArray(
    layers.map((layer) => layer.do_objectID),
  );
  const suggestedSymbolName = layers.length > 0 ? layers[0].name : undefined;

  const onSelectMenuItem = useCallback(
    async (value: LayerMenuItemType) => {
      switch (value) {
        case 'selectAll':
          if (isEditingText) {
            dispatch('selectAllText');
          } else {
            dispatch('selectAllLayers');
          }
          return;
        case 'delete':
          dispatch('deleteLayer', selectedLayerIds);
          return;
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

          return;
        case 'paste':
          // Works on safari
          document.execCommand('paste');

          const paste = async () => {
            try {
              // @ts-ignore (TS says that .read() doesn't exist but it does >,<)
              const clipboardItems = await navigator.clipboard.read();

              for (const clipboardItem of clipboardItems) {
                const blob = await clipboardItem.getType('text/html');
                const blobText = await blob.text();

                if (!blobText) return;

                const layers: Sketch.AnyLayer[] | undefined =
                  ClipboardUtils.fromEncodedHTML(blobText);

                if (!layers) return;

                dispatch('addLayer', layers);
              }
            } catch (e) {
              console.warn('Failed to paste');
            }
          };

          paste();
          return;
        case 'duplicate':
          dispatch('duplicateLayer', selectedLayerIds);
          return;
        case 'group': {
          dispatch('groupLayers', selectedLayerIds);
          return;
        }
        case 'ungroup':
          dispatch('ungroupLayers', selectedLayerIds);
          return;
        case 'createSymbol': {
          const name = await openDialog('New Symbol Name', suggestedSymbolName);

          if (!name) return;

          dispatch('createSymbol', selectedLayerIds, name);
          return;
        }
        case 'detachSymbol': {
          dispatch('detachSymbol', selectedLayerIds);
          return;
        }
        case 'useAsMask': {
          dispatch('setHasClippingMask', newUseAsMaskValue);
          return;
        }
        case 'ignoreMasks': {
          dispatch('setShouldBreakMaskChain', newIgnoreMasksValue);
          return;
        }
        case 'isAlphaMask':
          dispatch('setMaskMode', newIsAlphaMaskValue ? 'alpha' : 'outline');
          return;
        case 'lock': {
          dispatch('setLayerIsLocked', selectedLayerIds, true);
          return;
        }
        case 'unlock': {
          dispatch('setLayerIsLocked', selectedLayerIds, false);
          return;
        }
        case 'show': {
          dispatch('setLayerVisible', selectedLayerIds, true);
          return;
        }
        case 'hide': {
          dispatch('setLayerVisible', selectedLayerIds, false);
          return;
        }
        case 'rename': {
          startRenamingLayer(selectedLayerIds[0]);
          return;
        }
      }
    },
    [
      isEditingText,
      dispatch,
      selectedLayerIds,
      newIsAlphaMaskValue,
      openDialog,
      suggestedSymbolName,
      newUseAsMaskValue,
      newIgnoreMasksValue,
      startRenamingLayer,
    ],
  );

  return [menuItems, onSelectMenuItem] as const;
}
