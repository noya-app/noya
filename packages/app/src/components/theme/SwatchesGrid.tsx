import Sketch from '@sketch-hq/sketch-file-format-ts';
import { rgbaToHex } from 'noya-colorpicker';
import { GridView, sketchColorToRgba } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { memo, useMemo } from 'react';
import ColorSwatch from './ColorSwatch';

interface Props {
  swatches: Sketch.Swatch[];
  selectedSwatchIds: string[];
  onSelectSwatch: (id?: string, selectionType?: SelectionType) => void;
}

export default memo(function SwatchesGrid({
  swatches,
  selectedSwatchIds,
  onSelectSwatch,
}: Props) {
  const sortedSwatches = useMemo(
    () =>
      [...swatches].sort((a, b) => {
        const aName = a.name.toUpperCase();
        const bName = b.name.toUpperCase();

        return aName > bName ? 1 : aName < bName ? -1 : 0;
      }),
    [swatches],
  );

  return (
    <GridView.Root onClick={() => onSelectSwatch(undefined, 'replace')}>
      {sortedSwatches.map((item) => {
        const color = sketchColorToRgba(item.value);
        const hex = rgbaToHex(color);
        const alphaPercent = `${Math.round(color.a * 100)}%`;

        return (
          <GridView.Item
            id={item.do_objectID}
            key={item.do_objectID}
            title={item.name}
            subtitle={`${hex} — ${alphaPercent}`}
            selected={selectedSwatchIds.includes(item.do_objectID)}
            onClick={(event: React.MouseEvent) =>
              onSelectSwatch(
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
