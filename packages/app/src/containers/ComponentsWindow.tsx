import { rgbaToHex } from 'noya-colorpicker';
import { GridView, sketchColorToRgba } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import ColorSwatch from '../components/component/ColorSwatch';
import LayerStyle from '../components/component/LayerStyle';

import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

const Container = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

export default memo(function ComponentsWindow() {
  const [state, dispatch] = useApplicationState();

  const componentsTab = useSelector(Selectors.getCurrentComponentsTab);
  const sharedSwatches = useSelector(Selectors.getSharedSwatches);
  const sharedStyles = useSelector(Selectors.getSharedStyles);

  const sortedSwatches = useMemo(
    () =>
      [...sharedSwatches].sort((a, b) => {
        const aName = a.name.toUpperCase();
        const bName = b.name.toUpperCase();

        return aName > bName ? 1 : aName < bName ? -1 : 0;
      }),
    [sharedSwatches],
  );

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
    <Container>
      {componentsTab === 'swatches' && (
        <GridView.Root onClick={() => dispatch('selectSwatch', undefined)}>
          {sortedSwatches.map((item) => {
            const color = sketchColorToRgba(item.value);
            const hex = rgbaToHex(color).toUpperCase();
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
      )}
      {componentsTab === 'textStyles' && (
        <GridView.Root onClick={() => {}}></GridView.Root>
      )}
      {componentsTab === 'layerStyles' && (
        <GridView.Root onClick={() => dispatch('selectLayerStyle', undefined)}>
          {sortedStyles.map((item) => {
            return (
              <GridView.Item
                key={item.do_objectID}
                title={item.name}
                selected={state.selectedLayerStyleIds.includes(
                  item.do_objectID,
                )}
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
      )}
      {componentsTab === 'symbols' && (
        <GridView.Root onClick={() => {}}></GridView.Root>
      )}
    </Container>
  );
});
