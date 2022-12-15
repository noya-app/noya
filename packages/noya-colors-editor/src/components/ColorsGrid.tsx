import { rgbaToHex } from 'noya-colorpicker';
import {
  Autofade,
  Avatar,
  GridView,
  sketchColorToRgba,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SelectionType } from 'noya-state';
import { delimitedPath, sortBy } from 'noya-utils';
import React, { Fragment, memo, useCallback, useMemo } from 'react';
// import { useOpenInputDialog } from '../../contexts/DialogContext';
import { createThemeGroups } from '../utils/themeTree';
import ColorSwatch from './ColorSwatch';
// import { menuItems, ThemeMenuItemType } from './menuItems';

type Presence = [string, { selectedIds: string[]; timestamp: number }][];

interface Props {
  swatches: Sketch.Swatch[];
  selectedSwatchIds: string[];
  presence?: Presence;
  onDeleteSwatch?: () => void;
  onGroupSwatch?: (id: string[], name?: string) => void;
  onSelectSwatch?: (id?: string, selectionType?: SelectionType) => void;
  onDuplicateSwatch?: (id: string[]) => void;
}

export const ColorsGrid = memo(function ColorsGrid({
  swatches,
  selectedSwatchIds,
  presence,
  onGroupSwatch,
  onDeleteSwatch,
  onSelectSwatch,
  onDuplicateSwatch,
}: Props) {
  // const openDialog = useOpenInputDialog();
  const { basename } = delimitedPath;

  // const handleSelectMenuItem = useCallback(
  //   async (value: ThemeMenuItemType) => {
  //     switch (value) {
  //       case 'duplicate':
  //         onDuplicateSwatch(selectedSwatchIds);
  //         break;
  //       case 'delete':
  //         onDeleteSwatch();
  //         break;
  //       case 'group': {
  //         const groupName = await openDialog('Group Name');

  //         if (!groupName) return;

  //         onGroupSwatch(selectedSwatchIds, groupName);
  //         break;
  //       }
  //       case 'ungroup':
  //         onGroupSwatch(selectedSwatchIds);
  //         onSelectSwatch();
  //         break;
  //     }
  //   },
  //   [
  //     onDuplicateSwatch,
  //     selectedSwatchIds,
  //     onDeleteSwatch,
  //     onGroupSwatch,
  //     onSelectSwatch,
  //     openDialog,
  //   ],
  // );

  const handleOnContextMenu = useCallback(
    (id: string) => {
      if (selectedSwatchIds.includes(id)) return;
      onSelectSwatch?.(id);
    },
    [selectedSwatchIds, onSelectSwatch],
  );

  const groups = useMemo(() => {
    const groups = createThemeGroups(swatches).filter(
      (group) => group.items.length,
    );

    return sortBy(groups, 'path');
  }, [swatches]);

  return (
    <GridView.Root onClick={() => onSelectSwatch?.(undefined, 'replace')}>
      {groups.map((group, index) => (
        <Fragment key={index}>
          {group.path && <GridView.SectionHeader title={group.path} />}
          <GridView.Section>
            {group.items.map((item: Sketch.Swatch) => {
              const color = sketchColorToRgba(item.value);
              const hex = rgbaToHex(color);
              const alphaPercent = `${Math.round(color.a * 100)}%`;

              const activeUser = presence?.find(([userId, value]) =>
                value.selectedIds.includes(item.do_objectID),
              );

              return (
                <GridView.Item
                  id={item.do_objectID}
                  key={item.do_objectID}
                  title={basename(item.name)}
                  subtitle={`${hex} — ${alphaPercent}`}
                  selected={selectedSwatchIds.includes(item.do_objectID)}
                  onClick={(event: React.MouseEvent) =>
                    onSelectSwatch?.(
                      item.do_objectID,
                      event.shiftKey ? 'intersection' : 'replace',
                    )
                  }
                  badge={
                    activeUser && (
                      <Autofade timestamp={activeUser[1].timestamp}>
                        <Avatar />
                      </Autofade>
                    )
                  }
                  onContextMenu={() => handleOnContextMenu(item.do_objectID)}
                  // menuItems={menuItems}
                  // onSelectMenuItem={handleSelectMenuItem}
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
