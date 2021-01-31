import { memo, ReactNode } from 'react';
import styled from 'styled-components';
import * as Spacer from '../Spacer';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import produce from 'immer';

const Row = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const Title = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
}));

const ArrayControllerContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

interface ArrayControllerProps<Item> {
  value: Item[];
  title: ReactNode;
  onChange: (item: Item[]) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  getKey?: (item: Item) => string | number;
  children: (item: Item) => ReactNode;
}

function ArrayController<Item extends { isEnabled: boolean }>({
  value,
  title,
  getKey,
  onChange,
  onClickPlus,
  onClickTrash,
  children: renderItem,
}: ArrayControllerProps<Item>) {
  return (
    <ArrayControllerContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>{title}</Title>
        <Spacer.Horizontal />
        {onClickTrash && value.some((item) => !item.isEnabled) && (
          <span onClick={onClickTrash}>
            <TrashIcon />
          </span>
        )}
        {onClickPlus && (
          <span onClick={onClickPlus}>
            <PlusIcon />
          </span>
        )}
      </div>
      {value.map((item, index) => (
        <Row key={getKey?.(item) ?? index}>
          <input
            type="checkbox"
            style={{ margin: 0 }}
            checked={value[index].isEnabled}
            onChange={(event) => {
              const checked = event.target.checked;

              onChange(
                produce(value, (value) => {
                  value[index].isEnabled = checked;
                }),
              );
            }}
          />
          <Spacer.Horizontal size={8} />
          {renderItem(item)}
        </Row>
      ))}
    </ArrayControllerContainer>
  );
}

export default memo(ArrayController) as typeof ArrayController;
