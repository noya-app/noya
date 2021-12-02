import { memo, ReactNode } from 'react';
import styled from 'styled-components';
import ArrayController from './ArrayController';

type BaseArrayItem = { isEnabled: boolean };

const Checkbox = styled.input({
  margin: 0,
});

interface CheckboxArrayControllerProps<Item> {
  id: string;
  value: Item[];
  title: ReactNode;
  sortable?: boolean;
  expanded?: boolean;
  expandedContent?: ReactNode;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
  onChangeCheckbox?: (index: number, checked: boolean) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  onClickExpand?: () => void;
  getKey?: (item: Item) => string;
  renderItem: (props: {
    item: Item;
    index: number;
    checkbox: ReactNode;
  }) => ReactNode;
}

function CheckboxArrayController<Item extends BaseArrayItem>({
  id,
  value,
  title,
  sortable = true,
  expanded = false,
  expandedContent,
  getKey,
  onMoveItem,
  onClickPlus,
  onClickTrash,
  onClickExpand,
  onChangeCheckbox,
  renderItem,
}: CheckboxArrayControllerProps<Item>) {
  const getCheckboxElement = (index: number) =>
    onChangeCheckbox ? (
      <Checkbox
        type="checkbox"
        checked={value[index].isEnabled}
        onChange={(event) => {
          onChangeCheckbox(index, event.target.checked);
        }}
      />
    ) : null;

  const showTrash = value.some((item) => !item.isEnabled);

  return (
    <ArrayController<Item>
      id={id}
      items={value}
      getKey={getKey}
      title={title}
      expanded={expanded}
      sortable={sortable}
      expandedContent={expandedContent}
      onMoveItem={onMoveItem}
      onClickPlus={onClickPlus}
      onClickTrash={showTrash ? onClickTrash : undefined}
      onClickExpand={onClickExpand}
      renderItem={({ item, index }) =>
        renderItem({ item, index, checkbox: getCheckboxElement(index) })
      }
    />
  );
}

export default memo(CheckboxArrayController);
