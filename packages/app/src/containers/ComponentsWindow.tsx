import { memo, useMemo } from 'react';
import ColorSwatch from '../components/swatches/ColorSwatch';
import { GridView } from 'noya-designsystem';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import { getSharedSwatches } from 'noya-state/src/selectors';
import { rgbaToHex } from 'noya-colorpicker';

export default memo(function ComponentsWindow() {
  const [state, dispatch] = useApplicationState();

  const sharedSwatches = getSharedSwatches(state);
  const sortedItems = useMemo(
    () =>
      [...sharedSwatches].sort((a, b) => {
        const aName = a.name.toUpperCase();
        const bName = b.name.toUpperCase();

        return aName > bName ? 1 : aName < bName ? -1 : 0;
      }),
    [sharedSwatches],
  );

  return (
    <GridView.Root onClick={() => dispatch('selectSwatch', undefined)}>
      {sortedItems.map((item) => {
        const color = {
          a: item.value.alpha,
          r: Math.round(item.value.red * 255),
          g: Math.round(item.value.green * 255),
          b: Math.round(item.value.blue * 255),
        };

        return (
          <GridView.Item
            key={item.do_objectID}
            title={item.name}
            subtitle={`${rgbaToHex(color)} - ${Math.round(color.a * 100)}%`}
            selected={state.selectedSwatchIds.includes(item.do_objectID)}
            onClick={(event) =>
              dispatch(
                'selectSwatch',
                item.do_objectID,
                event.shiftKey ? 'intersection' : 'replace',
              )
            }
          >
            <ColorSwatch value={item.value} />
          </GridView.Item>
        );
      })}
    </GridView.Root>
  );
});
