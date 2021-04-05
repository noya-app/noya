import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { memo, useMemo } from 'react';
import LayerStyle from './LayerStyle';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedSharedStyleIds: string[];
  onSelectSharedStyle: (id?: string, selectionType?: SelectionType) => void;
}

export default memo(function LayerStylesGrid({
  sharedStyles,
  selectedSharedStyleIds: selectedIds,
  onSelectSharedStyle,
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

  return (
    <GridView.Root onClick={() => onSelectSharedStyle(undefined, 'replace')}>
      {sortedStyles.map((item) => {
        return (
          <GridView.Item
            key={item.do_objectID}
            title={item.name}
            selected={selectedIds.includes(item.do_objectID)}
            onClick={(event) =>
              onSelectSharedStyle(
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
