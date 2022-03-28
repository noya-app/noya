import React, {
  memo,
  useRef,
  useMemo,
  useState,
  useCallback,
  useLayoutEffect,
} from 'react';

import {
  useSelector,
  useWorkspace,
  useApplicationState,
  useGetStateSnapshot,
} from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { isDeepEqual } from 'noya-utils';
import { Layers, Selectors } from 'noya-state';
import { useDeepMemo, useShallowArray } from 'noya-react-utils';
import { Layout, ListView, TreeView, Sortable } from 'noya-designsystem';
import useLayerMenu from '../hooks/useLayerMenu';
import { LayerListProps, LayerListItem } from './types';
import IconContainer from './IconContainer';
import { flattenLayerList } from './utils';
import LayerIcon from './LayerIcon';
import LayerRow from './LayerRow';

export default memo(function LayerList(props: LayerListProps) {
  const { size, filter } = props;
  const { startRenamingLayer } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const getStateSnapshot = useGetStateSnapshot();
  const page = useSelector(Selectors.getCurrentPage);
  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const modKey = 'metaKey'; //useModKey();

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
      const handlePress = (info: TreeView.TreeViewClickInfo) => {
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
                  <Layout.Icon name="mask-on" />
                  <Layout.Queue size={4} />
                </>
              ) : isWithinMaskChain ? (
                <>
                  <Layout.Icon name="arrow-down" />
                  <Layout.Queue size={4} />
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

  const ref = useRef<ListView.IVirtualizedList | null>(null);

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
        (
          sourceIndex,
          destinationIndex,
          position: Sortable.RelativeDropPosition,
        ) => {
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
          relationDropPosition: Sortable.RelativeDropPosition,
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
