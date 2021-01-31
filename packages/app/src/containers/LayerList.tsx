import { useMemo } from 'react';
import * as ListView from '../components/ListView';
import {
  useApplicationState,
  useCurrentPage,
} from '../contexts/ApplicationStateContext';
import withSeparatorElements from '../utils/withSeparatorElements';

interface Props {}

export default function LayerList(props: Props) {
  const [state, dispatch] = useApplicationState();
  const page = useCurrentPage();

  const layerElements = useMemo(() => {
    return withSeparatorElements(
      page.layers.map((layer) => (
        <ListView.Row
          key={layer.do_objectID}
          selected={state.selectedObjects.includes(layer.do_objectID)}
          onClick={() => {
            dispatch(['interaction', { type: 'none' }]);
            dispatch(['selectLayer', layer.do_objectID]);
          }}
        >
          {layer.name}
        </ListView.Row>
      )),
      <ListView.Spacer />,
    );
  }, [state, dispatch, page.layers]);

  return (
    <ListView.Root>
      <ListView.Spacer />
      {layerElements}
      <ListView.Spacer />
    </ListView.Root>
  );
}
