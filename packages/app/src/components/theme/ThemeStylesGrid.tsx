import { GridView, useOpenInputDialog } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SelectionType } from 'noya-state';
import { delimitedPath, sortBy } from 'noya-utils';
import React, { Fragment, memo, useCallback, useMemo } from 'react';
import { createThemeGroups } from '../../utils/themeTree';
import { menuItems, ThemeMenuItemType } from './menuItems';
import ThemeStyle from './ThemeStyle';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedThemeStyleIds: string[];
  onGroupThemeStyle: (id: string[], name?: string) => void;
  onDeleteThemeStyle: (id?: string) => void;
  onSelectThemeStyle: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateThemeStyle: (id: string[]) => void;
}

export default memo(function ThemeStylesGrid({
  sharedStyles,
  selectedThemeStyleIds,
  onGroupThemeStyle,
  onDeleteThemeStyle,
  onSelectThemeStyle,
  onDuplicateThemeStyle,
}: Props) {
  const openDialog = useOpenInputDialog();

  const { basename } = delimitedPath;

  const handleSelectMenuItem = useCallback(
    async (value: ThemeMenuItemType) => {
      switch (value) {
        case 'delete':
          onDeleteThemeStyle();
          break;
        case 'group': {
          const groupName = await openDialog('Group Name');

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
      onGroupThemeStyle,
      selectedThemeStyleIds,
      onSelectThemeStyle,
      onDuplicateThemeStyle,
      openDialog,
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
                <GridView.Item<ThemeMenuItemType>
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
