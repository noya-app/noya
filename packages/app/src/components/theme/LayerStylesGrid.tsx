import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { memo, useMemo, useCallback } from 'react';
import LayerStyle from './LayerStyle';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedThemeStyleIds: string[];
  onDeleteThemeStyle: (id?: string) => void;
  onSelectThemeStyle: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateThemeStyle: (id: string[]) => void;
}

type MenuItemType = 'duplicate' | 'delete';

export default memo(function LayerStylesGrid({
  sharedStyles,
  selectedThemeStyleIds,
  onDeleteThemeStyle,
  onSelectThemeStyle,
  onDuplicateThemeStyle,
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
      { value: 'duplicate', title: 'Duplicate' },
      { value: 'delete', title: 'Delete' },
    ],
    [],
  );
  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'delete':
          onDeleteThemeStyle();
          break;
        case 'duplicate':
          onDuplicateThemeStyle(selectedThemeStyleIds);
          break;
      }
    },
    [onDeleteThemeStyle, onDuplicateThemeStyle, selectedThemeStyleIds],
  );

  return (
    <GridView.Root onClick={() => onSelectThemeStyle(undefined, 'replace')}>
      <GridView.Section>
        {sortedStyles.map((item) => {
          return (
            <GridView.Item<MenuItemType>
              id={item.do_objectID}
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
      </GridView.Section>
    </GridView.Root>
  );
});
