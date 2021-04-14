import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ForwardedRef, forwardRef, memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import * as ListView from './ListView';
import { ListViewRowProps } from './ListView';
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

export type TreeRowProps<
  MenuItemType extends string
> = ListViewRowProps<MenuItemType> & TreeRowBaseProps;

const TreeRow = forwardRef(function TreeRow<MenuItemType extends string>(
  {
    depth,
    icon,
    expanded,
    onClickChevron,
    children,
    ...rest
  }: TreeRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLLIElement>,
) {
  const handleClickChevron = useCallback(
    (event) => {
      event.stopPropagation();
      onClickChevron?.();
    },
    [onClickChevron],
  );

  return (
    <ListView.Row ref={forwardedRef} {...rest}>
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
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

export const Root = ListView.Root;
export const RowTitle = ListView.RowTitle;
export const Row = memo(TreeRow);
export type TreeViewClickInfo = ListView.ListViewClickInfo;
