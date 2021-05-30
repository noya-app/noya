import {
  ArrowDownIcon,
  CircleIcon,
  Component1Icon,
  ComponentInstanceIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  FrameIcon,
  GroupIcon,
  ImageIcon,
  MaskOnIcon,
  SquareIcon,
  TextIcon,
} from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ContextMenu, Spacer, TreeView } from 'noya-designsystem';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { Layers, PageLayer, Selectors } from 'noya-state';
import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { visit } from 'tree-visit';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useDeepArray from '../hooks/useDeepArray';
import useShallowArray from '../hooks/useShallowArray';
import { useWorkspace } from '../hooks/useWorkspace';

const IconContainer = styled.span(({ theme }) => ({
  color: theme.colors.mask,
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
}));

type LayerType = PageLayer['_class'];

type LayerListItem = {
  type: LayerType;
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  selected: boolean;
  visible: boolean;
  hasClippingMask: boolean;
  shouldBreakMaskChain: boolean;
  isWithinMaskChain: boolean;
};

function flattenLayerList(
  page: Sketch.Page,
  selectedObjects: string[],
): LayerListItem[] {
  const flattened: LayerListItem[] = [];

  visit<PageLayer | Sketch.Page>(page, {
    getChildren: (layer) => {
      if (layer.layerListExpandedType === Sketch.LayerListExpanded.Collapsed) {
        return [];
      }

      return Layers.getChildren(layer).slice().reverse();
    },
    onEnter(layer, indexPath) {
      if (layer._class === 'page') return;

      const currentIndex = indexPath[indexPath.length - 1];

      const parent = Layers.accessReversed(
        page,
        indexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      flattened.push({
        type: layer._class,
        id: layer.do_objectID,
        name: layer.name,
        depth: indexPath.length - 1,
        expanded:
          layer.layerListExpandedType !== Sketch.LayerListExpanded.Collapsed,
        selected: selectedObjects.includes(layer.do_objectID),
        visible: layer.isVisible,
        hasClippingMask: layer.hasClippingMask ?? false,
        shouldBreakMaskChain: layer.shouldBreakMaskChain,
        isWithinMaskChain: Layers.isWithinMaskChain(parent, currentIndex),
      });
    },
  });

  return flattened;
}

export const LayerIcon = memo(function LayerIcon({
  type,
  selected,
  variant,
}: {
  type: LayerType;
  selected?: boolean;
  variant?: 'primary';
}) {
  const colors = useTheme().colors;

  const color =
    variant && !selected
      ? colors[variant]
      : selected
      ? colors.iconSelected
      : colors.icon;

  switch (type) {
    case 'rectangle':
      return <SquareIcon color={color} />;
    case 'oval':
      return <CircleIcon color={color} />;
    case 'text':
      return <TextIcon color={color} />;
    case 'artboard':
      return <FrameIcon color={color} />;
    case 'symbolMaster':
      return <Component1Icon color={color} />;
    case 'symbolInstance':
      return <ComponentInstanceIcon color={color} />;
    case 'group':
      return <GroupIcon color={color} />;
    case 'bitmap':
      return <ImageIcon color={color} />;
    default:
      return null;
  }
});

function isValidMaskType(type: LayerType): boolean {
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
      throw new Error('Exhaustive switch');
  }
}

function isValidMaskChainBreakerType(type: LayerType): boolean {
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
      throw new Error('Exhaustive switch');
  }
}

type MenuItemType =
  | 'duplicate'
  | 'group'
  | 'ungroup'
  | 'delete'
  | 'createSymbol'
  | 'detachSymbol'
  | 'useAsMask'
  | 'ignoreMasks';

const LayerRow = memo(
  forwardRef(function LayerRow(
    {
      name,
      selected,
      visible,
      isWithinMaskChain,
      onHoverChange,
      onChangeVisible,
      ...props
    }: TreeView.TreeRowProps<MenuItemType> & {
      name: string;
      selected: boolean;
      visible: boolean;
      isWithinMaskChain: boolean;
      onChangeVisible: (visible: boolean) => void;
    },
    forwardedRef: ForwardedRef<HTMLLIElement>,
  ) {
    const [hovered, setHovered] = useState(false);

    const handleHoverChange = useCallback(
      (hovered: boolean) => {
        onHoverChange?.(hovered);
        setHovered(hovered);
      },
      [onHoverChange],
    );

    const handleSetVisible = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onChangeVisible(true);
      },
      [onChangeVisible],
    );

    const handleSetHidden = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onChangeVisible(false);
      },
      [onChangeVisible],
    );

    return (
      <TreeView.Row<MenuItemType>
        ref={forwardedRef}
        onHoverChange={handleHoverChange}
        selected={selected}
        disabled={!visible}
        {...props}
      >
        <TreeView.RowTitle>{name}</TreeView.RowTitle>
        {(hovered || !visible) && (
          <>
            <Spacer.Horizontal size={4} />
            {visible ? (
              <EyeOpenIcon onClick={handleSetHidden} />
            ) : (
              <EyeClosedIcon onClick={handleSetVisible} />
            )}
          </>
        )}
      </TreeView.Row>
    );
  }),
);

export default memo(function LayerList() {
  const [state, dispatch] = useApplicationState();
  const page = useSelector(Selectors.getCurrentPage);
  const { highlightLayer } = useWorkspace();
  const selectedObjects = useShallowArray(state.selectedObjects);
  const items = useDeepArray(flattenLayerList(page, selectedObjects));

  const canUngroup =
    selectedObjects.length === 1 &&
    items.find((i) => i.id === selectedObjects[0])?.type === 'group';

  const canDetach =
    selectedObjects.length === 1 &&
    items.find((i) => i.id === selectedObjects[0])?.type === 'symbolInstance';

  const selectedItems = useMemo(
    () => items.filter((i) => selectedObjects.includes(i.id)),
    [items, selectedObjects],
  );

  const canBeMask = selectedItems.every((item) => isValidMaskType(item.type));
  const canBeMaskChainBreaker = selectedItems.every((item) =>
    isValidMaskChainBreakerType(item.type),
  );

  const canBeSymbol = useMemo(() => {
    return (
      selectedItems.length >= 1 &&
      !selectedItems.some((l) => l.type === 'symbolMaster') &&
      (selectedItems.every((l) => l.type === 'artboard') ||
        selectedItems.every((l) => l.type !== 'artboard'))
    );
  }, [selectedItems]);

  const shouldAskForSymbolName =
    items.find((i) => i.id === selectedObjects[0])?.type !== 'artboard';

  const newUseAsMaskValue = !selectedItems.every(
    (item) => item.hasClippingMask,
  );

  const newIgnoreMasksValue = !selectedItems.every(
    (item) => item.shouldBreakMaskChain,
  );

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      ...(canBeSymbol
        ? [{ value: 'createSymbol' as const, title: 'Create Symbol' }]
        : []),
      ...(canDetach
        ? [{ value: 'detachSymbol' as const, title: 'Detach Symbol' }]
        : []),
      { value: 'group', title: 'Group' },
      ...(canUngroup ? [{ value: 'ungroup' as const, title: 'Ungroup' }] : []),
      { value: 'duplicate', title: 'Duplicate' },
      ContextMenu.SEPARATOR_ITEM,
      { value: 'delete', title: 'Delete' },
      ...(canBeMask || canBeMaskChainBreaker
        ? ([ContextMenu.SEPARATOR_ITEM] as const)
        : []),
      ...(canBeMask
        ? [
            {
              value: 'useAsMask' as const,
              title: 'Use as mask',
              checked: !newUseAsMaskValue,
            },
          ]
        : []),
      ...(canBeMaskChainBreaker
        ? [
            {
              value: 'ignoreMasks' as const,
              title: 'Ignore masks',
              checked: !newIgnoreMasksValue,
            },
          ]
        : []),
    ],
    [
      canBeMask,
      canBeMaskChainBreaker,
      canBeSymbol,
      canDetach,
      canUngroup,
      newIgnoreMasksValue,
      newUseAsMaskValue,
    ],
  );

  const onSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
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

  const layerElements = useMemo(() => {
    return items.map(
      (
        {
          id,
          name,
          depth,
          type,
          expanded,
          selected,
          visible,
          isWithinMaskChain,
          hasClippingMask,
        },
        index,
      ) => {
        const handleClick = (info: TreeView.TreeViewClickInfo) => {
          const { metaKey, shiftKey } = info;

          dispatch('interaction', ['reset']);

          if (metaKey) {
            dispatch(
              'selectLayer',
              id,
              selectedObjects.includes(id) ? 'difference' : 'intersection',
            );
          } else if (shiftKey && selectedObjects.length > 0) {
            const lastSelectedIndex = items.findIndex(
              (item) => item.id === selectedObjects[selectedObjects.length - 1],
            );

            const first = Math.min(index, lastSelectedIndex);
            const last = Math.max(index, lastSelectedIndex) + 1;

            dispatch(
              'selectLayer',
              items.slice(first, last).map((item) => item.id),
              'intersection',
            );
          } else {
            dispatch('selectLayer', id, 'replace');
          }
        };

        const handleHoverChange = (hovered: boolean) => {
          highlightLayer(
            hovered
              ? { id, precedence: 'aboveSelection', isMeasured: false }
              : undefined,
          );
        };

        const handleClickChevron = () =>
          dispatch('setExpandedInLayerList', id, !expanded);

        const handleChangeVisible = (value: boolean) =>
          dispatch('setLayerVisible', id, value);

        const handleContextMenu = () => {
          if (selected) return;

          dispatch('selectLayer', id);
        };

        const isSymbolClass =
          type === 'symbolInstance' || type === 'symbolMaster';
        const isArtboardClass = type === 'artboard' || type === 'symbolMaster';
        const isGroupClass = isArtboardClass || type === 'group';

        return (
          <LayerRow
            menuItems={menuItems}
            onSelectMenuItem={onSelectMenuItem}
            onContextMenu={handleContextMenu}
            key={id}
            name={name}
            visible={visible}
            isWithinMaskChain={isWithinMaskChain}
            depth={depth}
            selected={selected}
            onClick={handleClick}
            onHoverChange={handleHoverChange}
            onChangeVisible={handleChangeVisible}
            icon={
              <IconContainer>
                {hasClippingMask ? (
                  <>
                    <MaskOnIcon />
                    <Spacer.Horizontal size={4} />
                  </>
                ) : isWithinMaskChain ? (
                  <>
                    <ArrowDownIcon />
                    <Spacer.Horizontal size={4} />
                  </>
                ) : null}
                <LayerIcon
                  type={type}
                  selected={selected}
                  variant={isSymbolClass ? 'primary' : undefined}
                />
              </IconContainer>
            }
            isSectionHeader={isArtboardClass}
            expanded={isGroupClass ? expanded : undefined}
            onClickChevron={handleClickChevron}
          />
        );
      },
    );
  }, [
    items,
    menuItems,
    onSelectMenuItem,
    dispatch,
    selectedObjects,
    highlightLayer,
  ]);

  return (
    <TreeView.Root
      scrollable
      onClick={useCallback(() => dispatch('selectLayer', undefined), [
        dispatch,
      ])}
    >
      {layerElements}
    </TreeView.Root>
  );
});
