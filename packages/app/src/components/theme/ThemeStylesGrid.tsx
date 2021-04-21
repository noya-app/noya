import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useMemo, useCallback, Fragment } from 'react';
import { ContextMenu, GridView } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { delimitedPath, sortBy } from 'noya-utils';
import { createThemeGroups } from '../../utils/themeTree';
import ThemeStyle from './ThemeStyle';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedThemeStyleIds: string[];
  onGroupThemeStyle: (id: string[], name?: string) => void;
  onDeleteThemeStyle: (id?: string) => void;
  onSelectThemeStyle: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateThemeStyle: (id: string[]) => void;
}

type MenuItemType = 'duplicate' | 'delete' | 'group' | 'ungroup';

export default memo(function ThemeStylesGrid({
  sharedStyles,
  selectedThemeStyleIds,
  onGroupThemeStyle,
  onDeleteThemeStyle,
  onSelectThemeStyle,
  onDuplicateThemeStyle,
}: Props) {
  const { basename } = delimitedPath;

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'duplicate', title: 'Duplicate' },
      { value: 'group', title: 'Group' },
      { value: 'ungroup', title: 'Ungroup' },
      ContextMenu.SEPARATOR_ITEM,
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
        case 'group': {
          const groupName = prompt('Group Name');
          if (!groupName) return;
          onGroupThemeStyle(selectedThemeStyleIds, groupName);
          break;
        }
        case 'ungroup':
          onGroupThemeStyle(selectedThemeStyleIds);
          onSelectThemeStyle();
          break;
        case 'duplicate':
          onDuplicateThemeStyle(selectedThemeStyleIds);
          break;
      }
    },
    [
      onDeleteThemeStyle,
      onSelectThemeStyle,
      onGroupThemeStyle,
      onDuplicateThemeStyle,
      selectedThemeStyleIds,
    ],
  );

  const groups = useMemo(() => {
    const groups = createThemeGroups(sharedStyles).filter(
      (group) => group.items.length,
    );

    return sortBy(groups, 'path');
  }, [sharedStyles]);

  const handleOnContextMenu: (id: string) => void = useCallback(
    (id: string) => {
      if (selectedThemeStyleIds.includes(id)) return;
      onSelectThemeStyle(id);
    },
    [selectedThemeStyleIds, onSelectThemeStyle],
  );

  return (
    <GridView.Root onClick={() => onSelectThemeStyle(undefined, 'replace')}>
      {groups.map((group, index) => (
        <Fragment key={index}>
          {group.path && <GridView.SectionHeader title={group.path} />}
          <GridView.Section>
            {group.items.map((item) => {
              return (
                <GridView.Item<MenuItemType>
                  id={item.do_objectID}
                  key={item.do_objectID}
                  title={basename(item.name)}
                  menuItems={menuItems}
                  selected={selectedThemeStyleIds.includes(item.do_objectID)}
                  onSelectMenuItem={handleSelectMenuItem}
                  onContextMenu={() => handleOnContextMenu(item.do_objectID)}
                  onClick={(event: React.MouseEvent) =>
                    onSelectThemeStyle(
                      item.do_objectID,
                      event.shiftKey ? 'intersection' : 'replace',
                    )
                  }
                >
                  <ThemeStyle style={item.value} />
                </GridView.Item>
              );
            })}
          </GridView.Section>
        </Fragment>
      ))}
    </GridView.Root>
  );
});
