import React, {
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
} from 'react';
import IconButton from './IconButton';
import * as ListView from './ListView';
import { ListViewRowProps } from './ListView';
import * as Spacer from './Spacer';

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

type TreeRowBaseProps = {
  icon?: ReactNode;
  expanded?: boolean;
  onClickChevron?: ({ altKey }: { altKey: boolean }) => void;
};

export type TreeRowProps<MenuItemType extends string> =
  ListViewRowProps<MenuItemType> & TreeRowBaseProps;

const TreeRow = forwardRef(function TreeRow<MenuItemType extends string>(
  {
    icon,
    expanded,
    onClickChevron,
    children,
    ...rest
  }: TreeRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLLIElement>,
) {
  const { expandable } = useContext(ListView.ListRowContext);

  const handleClickChevron = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onClickChevron?.({ altKey: event.altKey });
    },
    [onClickChevron],
  );

  return (
    <ListView.Row ref={forwardedRef} {...rest}>
      {expandable && (
        <>
          {expanded === undefined ? (
            <Spacer.Horizontal size={15} />
          ) : (
            <IconButton
              iconName={expanded ? 'ChevronDownIcon' : 'ChevronRightIcon'}
              onClick={handleClickChevron}
              selected={rest.selected}
            />
          )}
          <Spacer.Horizontal size={6} />
        </>
      )}
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
export const EditableRowTitle = ListView.EditableRowTitle;
export const Row = memo(TreeRow);
export type TreeViewClickInfo = ListView.ListViewClickInfo;
