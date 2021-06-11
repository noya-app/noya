import Sketch from '@sketch-hq/sketch-file-format-ts';
import { createSectionedMenu } from 'noya-designsystem';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { useCallback, useMemo } from 'react';
import { useDispatch } from '../contexts/ApplicationStateContext';

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
    case 'artboard':
    case 'group':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolInstance':
    case 'symbolMaster':
    case 'text':
      return false;
    default:
      throw new Error(`Exhaustive switch: ${type}`);
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
    case 'artboard':
    case 'MSImmutableHotspotLayer':
    case 'slice':
    case 'symbolMaster':
      return false;
    default:
      throw new Error(`Exhaustive switch: ${type}`);
  }
}

export type LayerMenuItemType =
  | 'selectAll'
  | 'duplicate'
  | 'group'
  | 'ungroup'
  | 'delete'
  | 'createSymbol'
  | 'detachSymbol'
  | 'useAsMask'
  | 'ignoreMasks'
  | 'lock'
  | 'unlock'
  | 'hide'
  | 'show';

interface ILayer {
  _class: Sketch.AnyLayer['_class'];
  do_objectID: string;
  hasClippingMask?: boolean;
  shouldBreakMaskChain: boolean;
  isLocked: boolean;
  isVisible: boolean;
}

export default function useLayerMenu(layers: ILayer[]) {
  const dispatch = useDispatch();
  const selectedObjects = layers.map((layer) => layer.do_objectID);

  const hasSelectedLayers = layers.length > 0;

  const canUngroup = layers.length === 1 && layers[0]._class === 'group';

  const canDetach =
    layers.length === 1 && layers[0]._class === 'symbolInstance';

  const canBeMask = layers.every((item) =>
    isValidClippingMaskType(item._class),
  );

  const canBeMaskChainBreaker = layers.every((item) =>
    isValidMaskChainBreakerType(item._class),
  );

  const canBeSymbol = useMemo(() => {
    return (
      layers.length >= 1 &&
      !layers.some((l) => l._class === 'symbolMaster') &&
      (layers.every((l) => l._class === 'artboard') ||
        layers.every((l) => l._class !== 'artboard'))
    );
  }, [layers]);

  const shouldAskForSymbolName =
    layers.length > 1 && layers[0]._class !== 'artboard';

  const newUseAsMaskValue = !layers.every((item) => item.hasClippingMask);

  const newIgnoreMasksValue = !layers.every(
    (item) => item.shouldBreakMaskChain,
  );

  const canUnlock = layers.some((item) => item.isLocked);

  const canLock =
    !canUnlock &&
    layers.every(
      (item) => !(item._class === 'artboard' || item._class === 'symbolMaster'),
    );

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
      newIgnoreMasksValue,
      newUseAsMaskValue,
    ],
  );

  const onSelectMenuItem = useCallback(
    (value: LayerMenuItemType) => {
      switch (value) {
        case 'selectAll':
          dispatch('selectAllLayers');
          return;
        case 'delete':
          dispatch('deleteLayer', selectedObjects);
          return;
        case 'duplicate':
          dispatch('duplicateLayer', selectedObjects);
          return;
        case 'group': {
          const name = prompt('New group Name');

          if (!name) return;
          dispatch('groupLayer', selectedObjects, name);
          return;
        }
        case 'ungroup':
          dispatch('ungroupLayer', selectedObjects);
          return;
        case 'createSymbol': {
          const name = shouldAskForSymbolName ? prompt('New Symbol Name') : ' ';

          if (!name) return;
          dispatch('createSymbol', selectedObjects, name);
          return;
        }
        case 'detachSymbol': {
          dispatch('detachSymbol', selectedObjects);
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
        case 'lock': {
          dispatch('setLayerIsLocked', selectedObjects, true);
          return;
        }
        case 'unlock': {
          dispatch('setLayerIsLocked', selectedObjects, false);
          return;
        }
        case 'show': {
          dispatch('setLayerVisible', selectedObjects, true);
          return;
        }
        case 'hide': {
          dispatch('setLayerVisible', selectedObjects, false);
          return;
        }
      }
    },
    [
      dispatch,
      newIgnoreMasksValue,
      newUseAsMaskValue,
      selectedObjects,
      shouldAskForSymbolName,
    ],
  );

  return [menuItems, onSelectMenuItem] as const;
}
