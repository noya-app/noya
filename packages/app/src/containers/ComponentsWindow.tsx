import { memo } from 'react';
import ColorSwatch from '../components/swatches/ColorSwatch';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import { getSharedSwatches } from 'noya-state/src/selectors';
import { rgbaToHex } from 'noya-colorpicker';

export default memo(function ComponentsWindow() {
  const [state, dispatch] = useApplicationState();

  const items = getSharedSwatches(state);

  const createSubtitle = (item: Sketch.Swatch) => {
    if (item._class === 'swatch') {
      const color = {
        a: item.value.alpha,
        r: Math.round(item.value.red * 255),
        g: Math.round(item.value.green * 255),
        b: Math.round(item.value.blue * 255),
      };

      return `${rgbaToHex(color)} - ${Math.round(color.a * 100)}%`;
    }
    return '';
  };

  return (
    <GridView.Root onClick={() => dispatch('selectSwatch', undefined)}>
      {items.map((item, index) => (
        <GridView.Item
          key={index}
          title={item.name}
          subtitle={createSubtitle(item)}
          selected={state.selectedSwatchIds.includes(item.do_objectID)}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();

            console.log(event);
            dispatch(
              'selectSwatch',
              item.do_objectID,
              event.shiftKey ? 'intersection' : 'replace',
            );
          }}
        >
          <ColorSwatch value={item.value} />
        </GridView.Item>
      ))}
    </GridView.Root>
  );
});
