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
};

function flattenLayerList(layers: PageLayer[]): LayerListItem[] {
  const flattened: LayerListItem[] = [];

  layers
    .slice()
    .reverse()
    .forEach((layer) => {
      visit(layer, {
        getChildren: (layer) => {
          if (
            layer.layerListExpandedType === Sketch.LayerListExpanded.Collapsed
          ) {
            return [];
          }

          return Layers.getChildren<PageLayer>(layer).slice().reverse();
        },
        onEnter(layer, indexPath) {
          flattened.push({
            type: layer._class,
            id: layer.do_objectID,
            name: layer.name,
            depth: indexPath.length,
            expanded:
              layer.layerListExpandedType === Sketch.LayerListExpanded.Expanded,
          });
        },
      });
    });

  return flattened;
}

export default function LayerList(props: Props) {
  const [state, dispatch] = useApplicationState();
  const selectedObjects = state.selectedObjects;
  const page = useSelector(Selectors.getCurrentPage);

  const layerElements = useMemo(() => {
    const items = flattenLayerList(page.layers);

    return items.map(({ id, name, depth, type, expanded }) => {
      const selected = selectedObjects.includes(id);

      const rowContent = (
        <>
          <Spacer.Horizontal size={depth * 12} />
          {name}
        </>
      );

      return type === 'artboard' ? (
        <ListView.SectionHeader
          key={id}
          selected={selected}
          onClick={() => {
            dispatch('interaction', { type: 'none' });
            dispatch('selectLayer', id);
          }}
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
          onClick={() => {
            dispatch('interaction', { type: 'none' });
            dispatch('selectLayer', id);
          }}
        >
          <Spacer.Horizontal size={6 + 15} />
          {rowContent}
        </ListView.Row>
      );
    });
  }, [dispatch, selectedObjects, page.layers]);

  return (
    <ListView.Root onClick={() => dispatch('deselectAllLayers')}>
      <ListView.Spacer />
      {layerElements}
      <ListView.Spacer />
    </ListView.Root>
  );
}
