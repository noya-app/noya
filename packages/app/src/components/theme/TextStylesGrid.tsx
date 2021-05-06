import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ContextMenu, GridView } from 'noya-designsystem';
import { delimitedPath } from 'noya-utils';
import { SelectionType } from 'noya-state';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import TextStyle from './TextStyle';
import { memo, useMemo, useCallback } from 'react';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedTextStyles: string[];
  onGroupTextStyle: (id: string[], name?: string) => void;
  onDeleteTextStyle: (id?: string) => void;
  onSelectTextStyle: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateTextStyle: (id: string[]) => void;
}

type MenuItemType = 'duplicate' | 'delete' | 'group' | 'ungroup';
export type SimpleTextDecoration = 'none' | 'underline' | 'strikethrough';

export default memo(function TextStylesGrid({
  sharedStyles,
  selectedTextStyles,
  onGroupTextStyle,
  onDuplicateTextStyle,
  onDeleteTextStyle,
  onSelectTextStyle,
}: Props) {
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
          onDeleteTextStyle();
          break;
        case 'group': {
          const groupName = prompt('Group Name');
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
      onDuplicateTextStyle,
      onSelectTextStyle,
      selectedTextStyles,
    ],
  );

  const handleOnContextMenu: (id: string) => void = useCallback(
    (id: string) => {
      if (selectedTextStyles.includes(id)) return;
      onSelectTextStyle(id);
    },
    [selectedTextStyles, onSelectTextStyle],
  );

  return (
    <GridView.Root onClick={() => onSelectTextStyle(undefined, 'replace')}>
      <GridView.Section>
        {sharedStyles.map((item) => {
          const text = delimitedPath.basename(item.name);
          const encoded = item.value.textStyle?.encodedAttributes;
          const color = encoded?.MSAttributedStringColorAttribute;
          const textTransform =
            encoded?.MSAttributedStringTextTransformAttribute;
          const attributes =
            encoded?.MSAttributedStringFontAttribute.attributes;

          const textDecoration = encoded?.underlineStyle
            ? 'underline'
            : encoded?.strikethroughStyle
            ? 'strikethrough'
            : 'none';
          if (!attributes || !color) return null;

          return (
            <GridView.Item
              id={item.do_objectID}
              key={item.do_objectID}
              selected={selectedTextStyles.includes(item.do_objectID)}
              title={text}
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
              <TextStyle
                text={text}
                size={attributes.size}
                color={color}
                textDecoration={textDecoration}
                textTransform={textTransform}
              />
            </GridView.Item>
          );
        })}
      </GridView.Section>
    </GridView.Root>
  );
});
