import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { SelectionType } from 'noya-state';
import { delimitedPath } from 'noya-utils';
import { memo } from 'react';
import { ThemeMenuItemType } from './menuItems';

interface Props {
  symbols: Sketch.SymbolMaster[];
  selectedSymbolsIds: string[];
  onSelectSymbol: (id?: string, selectionType?: SelectionType) => void;
}

export default memo(function SymbolsGrid({
  symbols,
  selectedSymbolsIds,
  onSelectSymbol,
}: Props) {
  const { basename } = delimitedPath;

  return (
    <GridView.Root onClick={() => onSelectSymbol(undefined, 'replace')}>
      <GridView.Section>
        {symbols.map((item: Sketch.SymbolMaster) => {
          return (
            <GridView.Item<ThemeMenuItemType>
              id={item.do_objectID}
              key={item.do_objectID}
              title={basename(item.name)}
              selected={selectedSymbolsIds.includes(item.do_objectID)}
              onClick={(event: React.MouseEvent) =>
                onSelectSymbol(
                  item.do_objectID,
                  event.shiftKey ? 'intersection' : 'replace',
                )
              }
            ></GridView.Item>
          );
        })}
      </GridView.Section>
    </GridView.Root>
  );
});
