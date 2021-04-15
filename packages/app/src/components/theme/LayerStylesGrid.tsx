import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView, ContextMenu } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { memo, useMemo, useCallback } from 'react';
import LayerStyle from './LayerStyle';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedThemeStyleIds: string[];
  onDeleteThemeStyle: (id?: string) => void;
  onSelectThemeStyle: (id?: string, selectionType?: SelectionType) => void;
}

type MenuItemType = 'delete' | 'copy';

export default memo(function LayerStylesGrid({
  sharedStyles,
  selectedThemeStyleIds,
  onDeleteThemeStyle,
  onSelectThemeStyle,
}: Props) {
  const sortedStyles = useMemo(
    () =>
      [...sharedStyles].sort((a, b) => {
        const aName = a.name.toUpperCase();
        const bName = b.name.toUpperCase();

        return aName > bName ? 1 : aName < bName ? -1 : 0;
      }),
    [sharedStyles],
  );

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'delete', title: 'Delete' },
      ContextMenu.SEPARATOR_ITEM,
      { value: 'copy', title: 'Copy' },
    ],
    [],
  );
  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'delete':
          onDeleteThemeStyle();
      }
    },
    [onDeleteThemeStyle],
  );

  return (
    <GridView.Root onClick={() => onSelectThemeStyle(undefined, 'replace')}>
      {sortedStyles.map((item) => {
        return (
          <GridView.Item
            key={item.do_objectID}
            title={item.name}
            menuItems={menuItems}
            selected={selectedThemeStyleIds.includes(item.do_objectID)}
            onSelectMenuItem={handleSelectMenuItem}
            onContextMenu={() => onSelectThemeStyle(item.do_objectID)}
            onClick={(event: React.MouseEvent) =>
              onSelectThemeStyle(
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
