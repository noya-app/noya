import Sketch from '@sketch-hq/sketch-file-format-ts';
import { rgbaToHex } from 'noya-colorpicker';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { ContextMenu, GridView, sketchColorToRgba } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { memo, useMemo, useCallback, Fragment } from 'react';
import { SwatchGroup, createSwatchTree } from '../../utils/createSwatchTree';
import { sortBy } from 'noya-utils';
import ColorSwatch from './ColorSwatch';

function flatten(
  swatch: SwatchGroup,
  parent: string,
): {
  path: string;
  swatches: Sketch.Swatch[];
}[] {
  const path = (parent ? parent + '/' : '') + swatch.name;

  return Array.prototype.concat.apply(
    {
      path: path,
      swatches: swatch.swatches,
    },
    swatch.children.map((x) => flatten(x, path)),
  );
}

interface Props {
  swatches: Sketch.Swatch[];
  selectedSwatchIds: string[];
  onDeleteSwatch: () => void;
  onGroupSwatch: (id: string[], name?: string) => void;
  onSelectSwatch: (id?: string, selectionType?: SelectionType) => void;
}

type MenuItemType = 'delete' | 'group' | 'ungroup';

export default memo(function SwatchesGrid({
  swatches,
  selectedSwatchIds,
  onGroupSwatch,
  onDeleteSwatch,
  onSelectSwatch,
}: Props) {
  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'delete', title: 'Delete' },
      ContextMenu.SEPARATOR_ITEM,
      { value: 'group', title: 'Group' },
      { value: 'ungroup', title: 'Ungroup' },
    ],
    [],
  );

  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'delete':
          onDeleteSwatch();
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
    [onSelectSwatch, onGroupSwatch, onDeleteSwatch, selectedSwatchIds],
  );

  const handleOnContextMenu = useCallback(
    (id: string) => {
      if (selectedSwatchIds.length && selectedSwatchIds.includes(id)) return;
      onSelectSwatch(id);
    },
    [selectedSwatchIds, onSelectSwatch],
  );

  const flatSwatchGroup = useMemo(
    () =>
      sortBy(
        flatten(createSwatchTree(swatches), '').filter(
          (group) => group.swatches.length,
        ),
        'path',
      ),
    [swatches],
  );

  return (
    <GridView.Root onClick={() => onSelectSwatch(undefined, 'replace')}>
      {flatSwatchGroup.map((group, index) => {
        const sortedSwatches = sortBy(group.swatches, 'name');

        return (
          <Fragment key={index}>
            {group.path && <GridView.SectionHeader title={group.path} />}
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
