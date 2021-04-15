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

const sortArray = (array: any[], key: string) =>
  [...array].sort((a, b) => {
    const aName = a[key].toUpperCase();
    const bName = b[key].toUpperCase();

    return aName > bName ? 1 : aName < bName ? -1 : 0;
  });

export default memo(function SwatchesGrid({
  swatches,
  selectedSwatchIds,
  onSelectSwatch,
}: Props) {
  const swatchesGrouped = useMemo(() => {
    const group: { title: string; items: Sketch.Swatch[] }[] = [];
    const indexes: { [key: string]: number } = {};

    swatches.forEach((swatch) => {
      const groupTitle = swatch.name.split('/').slice(0, -1).join('/');

      if (!(groupTitle in indexes)) {
        indexes[groupTitle] = group.length;
        group.push({ title: groupTitle, items: [] });
      }

      group[indexes[groupTitle]].items.push(swatch);
    });

    return sortArray(group, 'title');
  }, [swatches]);

  return (
    <GridView.Root onClick={() => onSelectSwatch(undefined, 'replace')}>
      {swatchesGrouped.map((group) => {
        const sortedSwatches = sortArray(group.items, 'name');

        return (
          <>
            {group.title && <GridView.SectionHeader title={group.title} />}
            <GridView.Section>
              {sortedSwatches.map((item) => {
                const color = sketchColorToRgba(item.value);
                const hex = rgbaToHex(color);
                const alphaPercent = `${Math.round(color.a * 100)}%`;
                const name = item.name.split('/').pop() || '';

                return (
                  <GridView.Item
                    id={item.do_objectID}
                    key={item.do_objectID}
                    title={name}
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
            </GridView.Section>
          </>
        );
      })}
    </GridView.Root>
  );
});
