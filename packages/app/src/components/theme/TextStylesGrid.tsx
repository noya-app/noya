import Sketch from 'noya-file-format';
import { GridView } from 'noya-designsystem';
import { delimitedPath, sortBy } from 'noya-utils';
import { SelectionType } from 'noya-state';
import { createThemeGroups } from '../../utils/themeTree';
import { Fragment, memo, useMemo, useCallback } from 'react';
import TextStyle from './TextStyle';
import { menuItems, ThemeMenuItemType } from './menuItems';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedTextStyles: string[];
  onGroupTextStyle: (id: string[], name?: string) => void;
  onDeleteTextStyle: (id?: string) => void;
  onSelectTextStyle: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateTextStyle: (id: string[]) => void;
}

export default memo(function TextStylesGrid({
  sharedStyles,
  selectedTextStyles,
  onGroupTextStyle,
  onDuplicateTextStyle,
  onDeleteTextStyle,
  onSelectTextStyle,
}: Props) {
  const handleSelectMenuItem = useCallback(
    (value: ThemeMenuItemType) => {
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
