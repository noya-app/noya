import { GridView, useOpenInputDialog } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SelectionType } from 'noya-state';
import { delimitedPath, sortBy } from 'noya-utils';
import React, { Fragment, memo, useCallback, useMemo } from 'react';
import { menuItems, ThemeMenuItemType } from '../utils/menuItems';
import { createThemeGroups } from '../utils/themeTree';
import { TextStyle } from './TextStyle';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedTextStyles: string[];
  onGroupTextStyle: (id: string[], name?: string) => void;
  onDeleteTextStyle: (id?: string) => void;
  onSelectTextStyle: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateTextStyle: (id: string[]) => void;
}

export const TextStylesGrid = memo(function TextStylesGrid({
  sharedStyles,
  selectedTextStyles,
  onGroupTextStyle,
  onDuplicateTextStyle,
  onDeleteTextStyle,
  onSelectTextStyle,
}: Props) {
  const openDialog = useOpenInputDialog();

  const handleSelectMenuItem = useCallback(
    async (value: ThemeMenuItemType) => {
      switch (value) {
        case 'delete':
          onDeleteTextStyle();
          break;
        case 'group': {
          const groupName = await openDialog('Group Name');

          if (!groupName) return;

          onGroupTextStyle(selectedTextStyles, groupName);
          break;
        }
        case 'ungroup':
          onGroupTextStyle(selectedTextStyles);
          onSelectTextStyle();
          break;
        case 'duplicate':
          onDuplicateTextStyle(selectedTextStyles);
          break;
      }
    },
    [
      onDeleteTextStyle,
      onGroupTextStyle,
      selectedTextStyles,
      onSelectTextStyle,
      onDuplicateTextStyle,
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
      if (selectedTextStyles.includes(id)) return;
      onSelectTextStyle(id);
    },
    [selectedTextStyles, onSelectTextStyle],
  );

  return (
    <GridView.Root onClick={() => onSelectTextStyle(undefined, 'replace')}>
      {groups.map((group, index) => (
        <Fragment key={index}>
          {group.path && <GridView.SectionHeader title={group.path} />}
          <GridView.Section>
            {group.items.map((item) => {
              const text = delimitedPath.basename(item.name);
              const encoded = item.value.textStyle?.encodedAttributes;
              const attributes =
                encoded?.MSAttributedStringFontAttribute.attributes;

              if (!attributes) return null;

              const [font, weight] = attributes.name
                .replace('MT', '')
                .split('-');

              return (
                <GridView.Item<ThemeMenuItemType>
                  id={item.do_objectID}
                  key={item.do_objectID}
                  selected={selectedTextStyles.includes(item.do_objectID)}
                  title={text}
                  subtitle={`${font} (${weight || 'Regular'}) - ${
                    attributes.size
                  }`}
                  menuItems={menuItems}
                  onSelectMenuItem={handleSelectMenuItem}
                  onContextMenu={() => handleOnContextMenu(item.do_objectID)}
                  onClick={(event: React.MouseEvent) =>
                    onSelectTextStyle(
                      item.do_objectID,
                      event.shiftKey ? 'intersection' : 'replace',
                    )
                  }
                >
                  <TextStyle name={text} style={item.value} />
                </GridView.Item>
              );
            })}
          </GridView.Section>
        </Fragment>
      ))}
    </GridView.Root>
  );
});
