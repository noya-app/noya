import {
  useApplicationState,
  useGetStateSnapshot,
  useSelector,
  useWorkspace,
} from 'noya-app-state-context';
import { LayerMenuItemType, useLayerMenu } from 'noya-canvas';
import {
  IconButton,
  ListView,
  RelativeDropPosition,
  Spacer,
  TreeView,
  usePlatformModKey,
  withSeparatorElements,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { Size } from 'noya-geometry';
import { ArrowDownIcon, MaskOnIcon } from 'noya-icons';
import { LayerIcon } from 'noya-inspector';
import { useDeepMemo, useShallowArray } from 'noya-react-utils';
import { Layers, PageLayer, Selectors } from 'noya-state';
import { isDeepEqual } from 'noya-utils';
import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { visit } from 'tree-visit';

const IconContainer = styled.span(({ theme }) => ({
  color: theme.colors.mask,
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
}));

type LayerType = PageLayer['_class'];

type LayerListItem = {
  type: LayerType | 'line';
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  selected: boolean;
  visible: boolean;
  hasClippingMask: boolean;
  shouldBreakMaskChain: boolean;
  isWithinMaskChain: boolean;
  isLocked: boolean;
};

function flattenLayerList(
  page: Sketch.Page,
  selectedLayerIds: string[],
  filteredLayerIds: Set<string>,
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
      if (Layers.isPageLayer(layer) || !filteredLayerIds.has(layer.do_objectID))
        return;

      const currentIndex = indexPath[indexPath.length - 1];

      const parent = Layers.accessReversed(
        page,
        indexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      flattened.push({
        type:
          Layers.isShapePath(layer) && Selectors.isLine(layer.points)
            ? 'line'
            : layer._class,
        id: layer.do_objectID,
        name: layer.name,
        depth: indexPath.length - 1,
        expanded:
          layer.layerListExpandedType !== Sketch.LayerListExpanded.Collapsed,
        selected: selectedLayerIds.includes(layer.do_objectID),
        visible: layer.isVisible,
        hasClippingMask: layer.hasClippingMask ?? false,
        shouldBreakMaskChain: layer.shouldBreakMaskChain,
        isWithinMaskChain: Layers.isWithinMaskChain(parent, currentIndex),
        isLocked: layer.isLocked,
      });
    },
  });

  return flattened;
}

const LayerRow = memo(
  forwardRef(function LayerRow(
    {
      name,
      selected,
      visible,
      isWithinMaskChain,
      onHoverChange,
      onChangeVisible,
      onChangeIsLocked,
      isLocked,
      isDragging,
      isEditing,
      onSubmitEditing,
      ...props
    }: TreeView.RowProps<LayerMenuItemType> & {
      name: string;
      selected: boolean;
      visible: boolean;
      isWithinMaskChain: boolean;
      isLocked: boolean;
      isDragging: boolean;
      isEditing: boolean;
      onChangeVisible: (visible: boolean) => void;
      onChangeIsLocked: (isLocked: boolean) => void;
      onSubmitEditing: (name: string) => void;
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

    const handleSetLocked = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onChangeIsLocked(true);
      },
      [onChangeIsLocked],
    );

    const handleSetUnlocked = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onChangeIsLocked(false);
      },
      [onChangeIsLocked],
    );

    const titleElement = <TreeView.RowTitle>{name}</TreeView.RowTitle>;

    return (
      <TreeView.Row<LayerMenuItemType>
        ref={forwardedRef}
        onHoverChange={handleHoverChange}
        selected={!isDragging && selected}
        disabled={!visible}
        hovered={!isDragging && hovered}
        tabIndex={-1}
        {...props}
      >
        {isEditing ? (
          <ListView.EditableRowTitle
            autoFocus
            value={name}
            onSubmitEditing={onSubmitEditing}
          />
        ) : isDragging ? (
          titleElement
        ) : (
          withSeparatorElements(
            [
              titleElement,
              isLocked ? (
                <IconButton
                  iconName="LockClosedIcon"
                  selected={selected}
                  onClick={handleSetUnlocked}
                />
              ) : hovered ? (
                <IconButton
                  iconName="LockOpen1Icon"
                  selected={selected}
                  onClick={handleSetLocked}
                />
              ) : null,
              !visible ? (
                <IconButton
                  iconName="EyeClosedIcon"
                  selected={selected}
                  onClick={handleSetVisible}
                />
              ) : hovered ? (
                <IconButton
                  iconName="EyeOpenIcon"
                  selected={selected}
                  onClick={handleSetHidden}
                />
              ) : isLocked ? (
                <Spacer.Horizontal size={15} />
              ) : null,
            ],
            <Spacer.Horizontal size={8} />,
          )
        )}
      </TreeView.Row>
    );
  }),
);

export default memo(function LayerList({
  size,
  filter,
}: {
  size: Size;
  filter: string;
}) {
  const { startRenamingLayer } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const getStateSnapshot = useGetStateSnapshot();
  const page = useSelector(Selectors.getCurrentPage);
  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const modKey = usePlatformModKey();

  const { highlightLayer, renamingLayer, didHandleFocus } = useWorkspace();
  const selectedLayerIds = useShallowArray(state.selectedLayerIds);
  const filteredLayerIds = useMemo(
    () =>
      Layers.getFilteredLayerAndAncestorIds(page, (layer) =>
        layer.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter, page],
  );
  const items = useDeepMemo(
    flattenLayerList(page, selectedLayerIds, filteredLayerIds),
  );

  const [menuItems, onSelectMenuItem] = useLayerMenu(
    selectedLayers,
    state.interactionState.type,
  );

  const [editingLayer, setEditingLayer] = useState<string | undefined>();

  useLayoutEffect(() => {
    if (!renamingLayer) return;

    setTimeout(() => {
      setEditingLayer(renamingLayer);
      didHandleFocus();
    }, 50);
  }, [didHandleFocus, renamingLayer]);

  const renderItem = useCallback(
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
        isLocked,
      }: LayerListItem,
      index: number,
      { isDragging }: ListView.ItemInfo,
    ) => {
      const handlePress = (info: TreeView.ClickInfo) => {
        dispatch('interaction', ['reset']);

        if (info[modKey]) {
          dispatch(
            'selectLayer',
            id,
            selectedLayerIds.includes(id) ? 'difference' : 'intersection',
          );
        } else if (info.shiftKey && selectedLayerIds.length > 0) {
          const lastSelectedIndex = items.findIndex(
            (item) => item.id === selectedLayerIds[selectedLayerIds.length - 1],
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

      const handleClickChevron = ({ altKey }: { altKey: boolean }) =>
        dispatch(
          'setExpandedInLayerList',
          id,
          !expanded,
          altKey ? 'recursive' : 'self',
        );

      const handleChangeVisible = (value: boolean) =>
        dispatch('setLayerVisible', id, value);

      const handleChangeIsLocked = (value: boolean) =>
        dispatch('setLayerIsLocked', id, value);

      const handleContextMenu = () => {
        if (selected) return;

        dispatch('selectLayer', id);
      };

      const handleSubmitEditing = (name: string) => {
        setEditingLayer(undefined);

        if (!name) return;

        dispatch('setLayerName', id, name);
      };

      const handleRename = () => {
        startRenamingLayer(id);
      };

      const isSymbolClass =
        type === 'symbolInstance' || type === 'symbolMaster';
      const isArtboardClass = type === 'artboard' || type === 'symbolMaster';
      const isGroupClass =
        isArtboardClass || type === 'group' || type === 'shapeGroup';

      return (
        <LayerRow
          id={id}
          menuItems={menuItems}
          onSelectMenuItem={onSelectMenuItem}
          onContextMenu={handleContextMenu}
          key={id}
          name={name}
          visible={visible}
          isWithinMaskChain={isWithinMaskChain}
          isLocked={isLocked}
          isDragging={isDragging}
          depth={depth}
          selected={selected}
          onPress={handlePress}
          onDoubleClick={handleRename}
          onHoverChange={handleHoverChange}
          onChangeVisible={handleChangeVisible}
          onChangeIsLocked={handleChangeIsLocked}
          isEditing={id === editingLayer}
          onSubmitEditing={handleSubmitEditing}
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
    [
      dispatch,
      editingLayer,
      highlightLayer,
      items,
      menuItems,
      modKey,
      onSelectMenuItem,
      selectedLayerIds,
      startRenamingLayer,
    ],
  );

  const ref = useRef<ListView.VirtualizedList | null>(null);

  const scrollToIndex =
    items.findIndex((item) => item.id === selectedLayerIds[0]) ?? -1;

  // Whenever selection changes, scroll the first selected layer into view
  useEffect(() => {
    if (scrollToIndex === -1) return;

    ref.current?.scrollToIndex(scrollToIndex);
  }, [scrollToIndex]);

  return (
    <TreeView.Root
      ref={ref}
      virtualized={size}
      data={items}
      renderItem={renderItem}
      keyExtractor={useCallback((item: LayerListItem) => item.id, [])}
      scrollable
      sortable={!editingLayer}
      pressEventName="onPointerDown"
      onPress={useCallback(
        () => dispatch('selectLayer', undefined),
        [dispatch],
      )}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex, position: RelativeDropPosition) => {
          const sourceId = items[sourceIndex].id;
          const sourceIds = selectedLayerIds.includes(sourceId)
            ? selectedLayerIds
            : sourceId;

          dispatch(
            'moveLayer',
            sourceIds,
            items[destinationIndex].id,
            position,
          );
        },
        [dispatch, items, selectedLayerIds],
      )}
      acceptsDrop={useCallback(
        (
          sourceId: string,
          destinationId: string,
          relationDropPosition: RelativeDropPosition,
        ) => {
          const sourceIds = selectedLayerIds.includes(sourceId)
            ? selectedLayerIds
            : sourceId;

          const state = getStateSnapshot();
          const page = Selectors.getCurrentPage(state);

          const sourcePaths = Layers.findAllIndexPaths(page, (layer) =>
            sourceIds.includes(layer.do_objectID),
          );
          const destinationPath = Layers.findIndexPath(
            page,
            (layer) => layer.do_objectID === destinationId,
          );

          if (sourcePaths.length === 0 || !destinationPath) return false;

          // Don't allow dragging into a descendant
          if (
            sourcePaths.some((sourcePath) =>
              isDeepEqual(
                sourcePath,
                destinationPath.slice(0, sourcePath.length),
              ),
            )
          )
            return false;

          const sourceLayers = sourcePaths.map((sourcePath) =>
            Layers.access(page, sourcePath),
          );
          const destinationLayer = Layers.access(page, destinationPath);

          const destinationExpanded =
            destinationLayer.layerListExpandedType !==
            Sketch.LayerListExpanded.Collapsed;

          // Don't allow dragging below expanded layers - we'll fall back to inside
          if (
            destinationExpanded &&
            Layers.isParentLayer(destinationLayer) &&
            destinationLayer.layers.length > 0 &&
            relationDropPosition === 'below'
          ) {
            return false;
          }

          // Artboards can't be moved into other layers
          if (
            sourceLayers.some(Layers.isSymbolMasterOrArtboard) &&
            (relationDropPosition === 'inside' || destinationPath.length > 1)
          ) {
            return false;
          }

          // Only allow dropping inside of parent layers
          if (
            relationDropPosition === 'inside' &&
            !Layers.isParentLayer(destinationLayer)
          ) {
            return false;
          }

          return true;
        },
        [getStateSnapshot, selectedLayerIds],
      )}
    />
  );
});
