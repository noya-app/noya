import Sketch from '@sketch-hq/sketch-file-format-ts';
import { rgbaToHex } from 'noya-colorpicker';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { ContextMenu, GridView, sketchColorToRgba } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { memo, useMemo, useCallback, Fragment } from 'react';
import ColorSwatch from './ColorSwatch';

interface Props {
  swatches: Sketch.Swatch[];
  selectedSwatchIds: string[];
  onGroupSwatch: (id: string[], name?: string) => void;
  onSelectSwatch: (id?: string, selectionType?: SelectionType) => void;
}

const sortArray = (array: any[], key: string) =>
  [...array].sort((a, b) => {
    const aName = a[key].toUpperCase();
    const bName = b[key].toUpperCase();

    return aName > bName ? 1 : aName < bName ? -1 : 0;
  });

type MenuItemType = 'delete' | 'group' | 'ungroup';

export default memo(function SwatchesGrid({
  swatches,
  selectedSwatchIds,
  onGroupSwatch,
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

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'delete', title: 'Delete' },
      ContextMenu.SEPARATOR_ITEM,
      { value: 'group', title: 'Group' },
      { value: 'ungroup', title: 'Ungroup' },
    ],
    [],
  );
  //Handle tree view sorting correctly
  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'delete':
          onSelectSwatch();
          break;
        case 'group': {
          const groupName = prompt('Group Name');
          if (!groupName) return;
          onGroupSwatch(selectedSwatchIds, groupName);
          break;
        }
        case 'ungroup':
          onGroupSwatch(selectedSwatchIds);
          onSelectSwatch();
          break;
      }
    },
    [onSelectSwatch, onGroupSwatch, selectedSwatchIds],
  );

  const handleOnContextMenu = useCallback(
    (id: string) => {
      if (selectedSwatchIds.length && selectedSwatchIds.includes(id)) return;
      onSelectSwatch(id);
    },
    [selectedSwatchIds, onSelectSwatch],
  );

  return (
    <GridView.Root onClick={() => onSelectSwatch(undefined, 'replace')}>
      {swatchesGrouped.map((group) => {
        const sortedSwatches = sortArray(group.items, 'name');

        return (
          <Fragment key={group.full}>
            {group.title && <GridView.SectionHeader title={group.title} />}
            <GridView.Section>
              {sortedSwatches.map((item) => {
                const color = sketchColorToRgba(item.value);
                const hex = rgbaToHex(color);
                const alphaPercent = `${Math.round(color.a * 100)}%`;
                const name = item.name.split('/').pop() || '';

                return (
                  <GridView.Item<MenuItemType>
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
                    onContextMenu={() => handleOnContextMenu(item.do_objectID)}
                    menuItems={menuItems}
                    onSelectMenuItem={handleSelectMenuItem}
                  >
                    <ColorSwatch value={item.value} />
                  </GridView.Item>
                );
              })}
            </GridView.Section>
          </Fragment>
        );
      })}
    </GridView.Root>
  );
});
