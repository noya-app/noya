import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { delimitedPath, sortBy } from 'noya-utils';
import { Fragment, memo, useCallback, useMemo } from 'react';
import { ThemeMenuItemType, menuItems } from './menuItems';
import Symbol from './Symbol';
import { createThemeGroups } from '../../utils/themeTree';

interface Props {
  symbols: Sketch.SymbolMaster[];
  selectedSymbolsIds: string[];
  onGroupSymbol: (id: string[], name?: string) => void;
  onDeleteSymbol: (id: string[]) => void;
  onDuplicateSymbol: (id: string[]) => void;
  onSelectSymbol: (id?: string, selectionType?: SelectionType) => void;
}

export default memo(function SymbolsGrid({
  symbols,
  selectedSymbolsIds,
  onDeleteSymbol,
  onGroupSymbol,
  onSelectSymbol,
  onDuplicateSymbol,
}: Props) {
  const { basename } = delimitedPath;

  const handleSelectMenuItem = useCallback(
    (value: ThemeMenuItemType) => {
      switch (value) {
        case 'delete':
          onDeleteSymbol(selectedSymbolsIds);
          break;
        case 'group': {
          const groupName = prompt('Group Name');
          if (!groupName) return;
          onGroupSymbol(selectedSymbolsIds, groupName);
          break;
        }
        case 'ungroup':
          onGroupSymbol(selectedSymbolsIds);
          onSelectSymbol();
          break;
        case 'duplicate':
          onDuplicateSymbol(selectedSymbolsIds);
          break;
      }
    },
    [
      onGroupSymbol,
      onDeleteSymbol,
      onSelectSymbol,
      onDuplicateSymbol,
      selectedSymbolsIds,
    ],
  );

  const groups = useMemo(() => {
    const groups = createThemeGroups(symbols).filter(
      (group) => group.items.length,
    );

    return sortBy(groups, 'path');
  }, [symbols]);

  const handleOnContextMenu: (id: string) => void = useCallback(
    (id: string) => {
      if (selectedSymbolsIds.includes(id)) return;
      onSelectSymbol(id);
    },
    [onSelectSymbol, selectedSymbolsIds],
  );

  return (
    <GridView.Root onClick={() => onSelectSymbol(undefined, 'replace')}>
      {groups.map((group, index) => (
        <Fragment key={index}>
          {group.path && <GridView.SectionHeader title={group.path} />}
          <GridView.Section>
            {group.items.map((item) => (
              <GridView.Item<ThemeMenuItemType>
                id={item.do_objectID}
                key={item.do_objectID}
                title={basename(item.name)}
                menuItems={menuItems}
                onSelectMenuItem={handleSelectMenuItem}
                onContextMenu={() => handleOnContextMenu(item.do_objectID)}
                selected={selectedSymbolsIds.includes(item.do_objectID)}
                onClick={(event: React.MouseEvent) =>
                  onSelectSymbol(
                    item.do_objectID,
                    event.shiftKey ? 'intersection' : 'replace',
                  )
                }
              >
                <Symbol layer={item} />
              </GridView.Item>
            ))}
          </GridView.Section>
        </Fragment>
      ))}
    </GridView.Root>
  );
});
