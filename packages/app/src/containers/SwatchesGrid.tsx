import { memo, useMemo } from 'react';
import ColorSwatch from '../components/theme/ColorSwatch';
import { GridView, sketchColorToRgba } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { rgbaToHex } from 'noya-colorpicker';

export default memo(function SwatchInspector() {
  const [state, dispatch] = useApplicationState();

  const sharedSwatches = useSelector(Selectors.getSharedSwatches);

  const sortedSwatches = useMemo(
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
      {sortedSwatches.map((item) => {
        const color = sketchColorToRgba(item.value);
        const hex = rgbaToHex(color);
        const alphaPercent = `${Math.round(color.a * 100)}%`;

        return (
          <GridView.Item
            key={item.do_objectID}
            title={item.name}
            subtitle={`${hex} — ${alphaPercent}`}
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
