import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ComponentProps, memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import * as ListView from './ListView';
import * as Spacer from './Spacer';

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

type TreeRowBaseProps = {
  icon?: ReactNode;
  depth: number;
  expanded?: boolean;
  onClickChevron?: () => void;
};

const ChevronContainer = styled.span({
  display: 'flex',
  alignItems: 'center',
});

type TreeRowProps = ComponentProps<typeof ListView['Row']> & TreeRowBaseProps;

function TreeRow({
  depth,
  icon,
  expanded,
  onClickChevron,
  children,
  ...rest
}: TreeRowProps) {
  const handleClickChevron = useCallback(
    (event) => {
      event.stopPropagation();
      onClickChevron?.();
    },
    [onClickChevron],
  );

  return (
    <ListView.Row {...rest}>
      <Spacer.Horizontal size={depth * 12} />
      {expanded === undefined ? (
        <Spacer.Horizontal size={15} />
      ) : (
        <ChevronContainer onClick={handleClickChevron}>
          {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </ChevronContainer>
      )}
      <Spacer.Horizontal size={6} />
      {icon && (
        <>
          {icon}
          <Spacer.Horizontal size={10} />
        </>
      )}
      {children}
    </ListView.Row>
  );
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

export const Root = ListView.Root;
export const RowTitle = ListView.RowTitle;
export const Row = memo(TreeRow);
export type TreeViewClickInfo = ListView.ListViewClickInfo;
