import {
  BoxModelIcon,
  CircleIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  GroupIcon,
  ImageIcon,
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
import { visit } from 'tree-visit';
import {
  useApplicationState,
  useSelector,
  useWorkspace,
} from '../contexts/ApplicationStateContext';
import useDeepArray from '../hooks/useDeepArray';
import useShallowArray from '../hooks/useShallowArray';

type LayerType = PageLayer['_class'];

type LayerListItem = {
  type: LayerType;
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  selected: boolean;
  visible: boolean;
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

      flattened.push({
        type: layer._class,
        id: layer.do_objectID,
        name: layer.name,
        depth: indexPath.length - 1,
        expanded:
          layer.layerListExpandedType === Sketch.LayerListExpanded.Expanded,
        selected: selectedObjects.includes(layer.do_objectID),
        visible: layer.isVisible,
      });
    },
  });

  return flattened;
}

const LayerIcon = memo(function LayerIcon({
  type,
  selected,
}: {
  type: LayerType;
  selected: boolean;
}) {
  const color = selected ? 'rgb(220, 220, 220)' : 'rgb(139, 139, 139)';

  switch (type) {
    case 'rectangle':
      return <SquareIcon color={color} />;
    case 'oval':
      return <CircleIcon color={color} />;
    case 'text':
      return <TextIcon color={color} />;
    case 'artboard':
    case 'symbolMaster':
      return <BoxModelIcon color={color} />;
    case 'group':
      return <GroupIcon color={color} />;
    case 'bitmap':
      return <ImageIcon color={color} />;
    default:
      return null;
  }
});

type MenuItemType = 'duplicate' | 'group' | 'ungroup' | 'delete';

const LayerRow = memo(
  forwardRef(function LayerRow(
    {
      name,
      selected,
      visible,
      onHoverChange,
      onChangeVisible,
      ...props
    }: TreeView.TreeRowProps<MenuItemType> & {
      name: string;
      selected: boolean;
      visible: boolean;
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

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'group', title: 'Group' },
      ...(canUngroup ? [{ value: 'ungroup' as const, title: 'Ungroup' }] : []),
      { value: 'duplicate', title: 'Duplicate' },
      ContextMenu.SEPARATOR_ITEM,
      { value: 'delete', title: 'Delete' },
    ],
    [canUngroup],
  );

  const onSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'delete':
          dispatch('deleteLayer', selectedObjects);
          return;
        case 'duplicate':
          // TODO: Handle duplicate
          return;
        case 'group':
          const name = prompt('New group Name');

          if (!name) return;

          dispatch('groupLayer', selectedObjects, name);
          return;
        case 'ungroup':
          dispatch('ungroupLayer', selectedObjects);
          return;
      }
    },
    [dispatch, selectedObjects],
  );

  const layerElements = useMemo(() => {
    return items.map(
      ({ id, name, depth, type, expanded, selected, visible }, index) => {
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
            hovered ? { id, precedence: 'aboveSelection' } : undefined,
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

        return (
          <LayerRow
            menuItems={menuItems}
            onSelectMenuItem={onSelectMenuItem}
            onContextMenu={handleContextMenu}
            key={id}
            name={name}
            visible={visible}
            depth={depth}
            selected={selected}
            onClick={handleClick}
            onHoverChange={handleHoverChange}
            onChangeVisible={handleChangeVisible}
            icon={<LayerIcon type={type} selected={selected} />}
            isSectionHeader={type === 'artboard' || type === 'symbolMaster'}
            expanded={
              type === 'artboard' || type === 'symbolMaster' || type === 'group'
                ? expanded
                : undefined
            }
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
      onClick={useCallback(() => dispatch('selectLayer', undefined), [
        dispatch,
      ])}
    >
      {layerElements}
    </TreeView.Root>
  );
});
