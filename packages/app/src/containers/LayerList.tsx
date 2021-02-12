import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Layers, PageLayer, Selectors } from 'ayano-state';
import { memo, useMemo } from 'react';
import { visit } from 'tree-visit';
import {
  SquareIcon,
  CircleIcon,
  TextIcon,
  BoxModelIcon,
  ImageIcon,
} from '@radix-ui/react-icons';
import * as ListView from '../components/ListView';
import * as Spacer from '../components/Spacer';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

interface Props {}

type LayerType = PageLayer['_class'];

type LayerListItem = {
  type: LayerType;
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  position: ListView.ListRowPosition;
  selected: boolean;
  selectedPosition: ListView.ListRowPosition;
};

function flattenLayerList(
  page: Sketch.Page,
  selectedObjects: string[],
): LayerListItem[] {
  const flattened: LayerListItem[] = [];

  visit(page, {
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
        position: 'only',
        selected: selectedObjects.includes(layer.do_objectID),
        selectedPosition: 'only',
      });
    },
  });

  for (let i = 0; i < flattened.length; i++) {
    const prev = flattened[i - 1];
    const current = flattened[i];
    const next = flattened[i + 1];

    const nextItem = next && next.type !== 'artboard';
    const prevItem = prev && prev.type !== 'artboard';

    if (nextItem && prevItem) {
      current.position = 'middle';
    } else if (nextItem && !prevItem) {
      current.position = 'first';
    } else if (!nextItem && prevItem) {
      current.position = 'last';
    }

    if (current.selected) {
      const nextSelected = next && next.type !== 'artboard' && next.selected;
      const prevSelected = prev && prev.type !== 'artboard' && prev.selected;

      if (nextSelected && prevSelected) {
        current.selectedPosition = 'middle';
      } else if (nextSelected && !prevSelected) {
        current.selectedPosition = 'first';
      } else if (!nextSelected && prevSelected) {
        current.selectedPosition = 'last';
      }
    }
  }

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
      return <BoxModelIcon color={color} />;
    case 'bitmap':
      return <ImageIcon color={color} />;
    default:
      return null;
  }
});

export default function LayerList(props: Props) {
  const [state, dispatch] = useApplicationState();
  const selectedObjects = state.selectedObjects;
  const page = useSelector(Selectors.getCurrentPage);

  const layerElements = useMemo(() => {
    const items = flattenLayerList(page, selectedObjects);

    return items.map(
      (
        {
          id,
          name,
          depth,
          type,
          expanded,
          position,
          selected,
          selectedPosition,
        },
        index,
      ) => {
        const rowContent = (
          <>
            <Spacer.Horizontal size={depth * 12} />
            <LayerIcon type={type} selected={selected} />
            <Spacer.Horizontal size={10} />
            {name}
          </>
        );

        const handleClick = (info: ListView.ListViewClickInfo) => {
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
          dispatch(
            'highlightLayer',
            hovered ? { id, precedence: 'aboveSelection' } : undefined,
          );
        };

        const rowProps = {
          key: id,
          selected,
          onClick: handleClick,
          onHoverChange: handleHoverChange,
        };

        return type === 'artboard' ? (
          <ListView.SectionHeader {...rowProps}>
            <span
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={(event) => {
                event.stopPropagation();

                dispatch('setExpandedInLayerList', id, !expanded);
              }}
            >
              {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </span>
            <Spacer.Horizontal size={6} />
            {rowContent}
          </ListView.SectionHeader>
        ) : (
          <ListView.Row
            {...rowProps}
            position={position}
            selectedPosition={selectedPosition}
          >
            <Spacer.Horizontal size={6 + 15} />
            {rowContent}
          </ListView.Row>
        );
      },
    );
  }, [dispatch, selectedObjects, page]);

  return (
    <ListView.Root onClick={() => dispatch('selectLayer', undefined)}>
      {layerElements}
    </ListView.Root>
  );
}
