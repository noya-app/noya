import { useMemo } from 'react';
import * as ListView from '../components/ListView';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import withSeparatorElements from '../utils/withSeparatorElements';

interface Props {}

export default function LayerList(props: Props) {
  const [state, dispatch] = useApplicationState();
  const page = state.sketch.pages.find(
    (page) => page.do_objectID === state.selectedPage,
  );

  const layerElements = useMemo(() => {
    const layers = page?.layers ?? [];

    return withSeparatorElements(
      layers.map((layer) => (
        <ListView.Row
          key={layer.do_objectID}
          selected={state.selectedObjects.includes(layer.do_objectID)}
          onClick={() => {
            dispatch(['selectLayer', layer.do_objectID]);
          }}
        >
          {layer.name}
        </ListView.Row>
      )),
      <ListView.Spacer />,
    );
  }, [state, dispatch, page?.layers]);

  return (
    <ListView.Root>
      <ListView.Spacer />
      {layerElements}
      <ListView.Spacer />
    </ListView.Root>
  );
}
