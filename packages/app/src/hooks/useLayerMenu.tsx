import Sketch from '@sketch-hq/sketch-file-format-ts';
import { createSectionedMenu, MenuItem } from 'noya-designsystem';
import { Layers } from 'noya-state';
import { useCallback, useMemo } from 'react';
import { useDispatch, useWorkspace } from 'noya-app-state-context';
import useShallowArray from './useShallowArray';

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
  | 'createSymbol'
  | 'detachSymbol'
  | 'useAsMask'
  | 'ignoreMasks'
  | 'isAlphaMask'
  | 'lock'
  | 'unlock'
  | 'hide'
  | 'show';

export default function useLayerMenu(layers: Sketch.AnyLayer[]) {
  const dispatch = useDispatch();
  const { startRenamingLayer } = useWorkspace();

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

  const shouldAskForSymbolName =
    layers.length > 1 && !Layers.isArtboard(layers[0]);

  const newUseAsMaskValue = !layers.every((item) => item.hasClippingMask);

  const newIsAlphaMaskValue = !layers.every(
    (item) => item.clippingMaskMode === 1,
  );

  const newIgnoreMasksValue = !layers.every(
    (item) => item.shouldBreakMaskChain,
  );

  const canUnlock = layers.some((layer) => layer.isLocked);

  const canLock =
    !canUnlock &&
    layers.every((layer) => !Layers.isSymbolMasterOrArtboard(layer));

  const canShow = layers.some((item) => !item.isVisible);

  const menuItems: MenuItem<LayerMenuItemType>[] = useMemo(
    () =>
      hasSelectedLayers
        ? createSectionedMenu(
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
              { value: 'group', title: 'Group' },
              canUngroup && { value: 'ungroup', title: 'Ungroup' },
            ],
            [{ value: 'duplicate', title: 'Duplicate' }],
            [{ value: 'delete', title: 'Delete' }],
            [
              canUnlock && { value: 'unlock', title: 'Unlock' },
              canLock && { value: 'lock', title: 'Lock' },
              canShow && { value: 'show', title: 'Show' },
              !canShow && { value: 'hide', title: 'Hide' },
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
          )
        : [{ value: 'selectAll', title: 'Select All' }],
    [
      canBeMask,
      canBeMaskChainBreaker,
      canBeSymbol,
      canDetach,
      canLock,
      canShow,
      canUngroup,
      canUnlock,
      hasSelectedLayers,
      newIsAlphaMaskValue,
      newIgnoreMasksValue,
      newUseAsMaskValue,
    ],
  );

  const selectedLayerIds = useShallowArray(
    layers.map((layer) => layer.do_objectID),
  );

  const onSelectMenuItem = useCallback(
    (value: LayerMenuItemType) => {
      switch (value) {
        case 'selectAll':
          dispatch('selectAllLayers');
          return;
        case 'delete':
          dispatch('deleteLayer', selectedLayerIds);
          return;
        case 'duplicate':
          dispatch('duplicateLayer', selectedLayerIds);
          return;
        case 'group': {
          const name = prompt('New Group Name');

          if (!name) return;

          dispatch('groupLayer', selectedLayerIds, name);
          return;
        }
        case 'ungroup':
          dispatch('ungroupLayer', selectedLayerIds);
          return;
        case 'createSymbol': {
          const name = shouldAskForSymbolName ? prompt('New Symbol Name') : ' ';

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
      dispatch,
      selectedLayerIds,
      newIsAlphaMaskValue,
      shouldAskForSymbolName,
      newUseAsMaskValue,
      newIgnoreMasksValue,
      startRenamingLayer,
    ],
  );

  return [menuItems, onSelectMenuItem] as const;
}
