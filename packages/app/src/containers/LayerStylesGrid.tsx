import { memo, useMemo } from 'react';
import { GridView } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import LayerStyle from '../components/component/LayerStyle';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

export default memo(function SwatchInspector() {
  const [state, dispatch] = useApplicationState();

  const sharedStyles = useSelector(Selectors.getSharedStyles);

  const sortedStyles = useMemo(
    () =>
      [...sharedStyles].sort((a, b) => {
        const aName = a.name.toUpperCase();
        const bName = b.name.toUpperCase();

        return aName > bName ? 1 : aName < bName ? -1 : 0;
      }),
    [sharedStyles],
  );

  return (
    <GridView.Root onClick={() => dispatch('selectLayerStyle', undefined)}>
      {sortedStyles.map((item) => {
        return (
          <GridView.Item
            key={item.do_objectID}
            title={item.name}
            selected={state.selectedLayerStyleIds.includes(item.do_objectID)}
            onClick={(event) =>
              dispatch(
                'selectLayerStyle',
                item.do_objectID,
                event.shiftKey ? 'intersection' : 'replace',
              )
            }
          >
            <LayerStyle style={item.value} />
          </GridView.Item>
        );
      })}
    </GridView.Root>
  );
});
