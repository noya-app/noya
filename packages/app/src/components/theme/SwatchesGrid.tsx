import Sketch from '@sketch-hq/sketch-file-format-ts';
import { rgbaToHex } from 'noya-colorpicker';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { ContextMenu, GridView, sketchColorToRgba } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { memo, useMemo, useCallback, Fragment } from 'react';
import { SwatchGroup, createSwatchTree } from '../../utils/createSwatchTree';
import { sortBy } from 'noya-utils';
import ColorSwatch from './ColorSwatch';
import { delimitedPath } from 'noya-utils';

function flatten(
  SwatchGroup: SwatchGroup,
  parent: string,
): {
  path: string;
  swatches: Sketch.Swatch[];
}[] {
  const path = (parent ? parent + '/' : '') + SwatchGroup.name;

  return [
    {
      path: path,
      swatches: SwatchGroup.swatches,
    },
    ...SwatchGroup.children.flatMap((x) => flatten(x, path)),
  ];
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
  const { basename } = delimitedPath;

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
      if (selectedSwatchIds.includes(id)) return;
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
      {flatSwatchGroup.map((group, index) => (
        <Fragment key={index}>
          {group.path && <GridView.SectionHeader title={group.path} />}
          <GridView.Section>
            {group.swatches.map((item: Sketch.Swatch) => {
              const color = sketchColorToRgba(item.value);
              const hex = rgbaToHex(color);
              const alphaPercent = `${Math.round(color.a * 100)}%`;

              return (
                <GridView.Item<MenuItemType>
                  id={item.do_objectID}
                  key={item.do_objectID}
                  title={basename(item.name)}
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
      ))}
    </GridView.Root>
  );
});
