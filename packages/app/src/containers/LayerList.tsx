import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Layers, PageLayer, Selectors } from 'ayano-state';
import { useMemo } from 'react';
import { visit } from 'tree-visit';
import * as ListView from '../components/ListView';
import * as Spacer from '../components/Spacer';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

interface Props {}

type LayerListItem = {
  type: PageLayer['_class'];
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  selected: boolean;
  position: ListView.ListRowPosition;
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
        selected: selectedObjects.includes(layer.do_objectID),
        position: 'only',
      });
    },
  });

  for (let i = 0; i < flattened.length; i++) {
    const prev = flattened[i - 1];
    const current = flattened[i];
    const next = flattened[i + 1];

    if (current.selected) {
      const nextSelected = next && next.type !== 'artboard' && next.selected;
      const prevSelected = prev && prev.type !== 'artboard' && prev.selected;

      if (nextSelected && prevSelected) {
        current.position = 'middle';
      } else if (nextSelected && !prevSelected) {
        current.position = 'first';
      } else if (!nextSelected && prevSelected) {
        current.position = 'last';
      }
    }
  }

  return flattened;
}

export default function LayerList(props: Props) {
  const [state, dispatch] = useApplicationState();
  const selectedObjects = state.selectedObjects;
  const page = useSelector(Selectors.getCurrentPage);

  const layerElements = useMemo(() => {
    const items = flattenLayerList(page, selectedObjects);

    return items.map(
      ({ id, name, depth, type, expanded, selected, position }, index) => {
        const rowContent = (
          <>
            <Spacer.Horizontal size={depth * 12} />
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

        return type === 'artboard' ? (
          <ListView.SectionHeader
            key={id}
            selected={selected}
            onClick={handleClick}
          >
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
            key={id}
            selected={selected}
            onClick={handleClick}
            position={position}
          >
            <Spacer.Horizontal size={6 + 15} />
            {rowContent}
          </ListView.Row>
        );
      },
    );
  }, [dispatch, selectedObjects, page]);

  return (
    <ListView.Root onClick={() => dispatch('deselectAllLayers')}>
      {layerElements}
    </ListView.Root>
  );
}
