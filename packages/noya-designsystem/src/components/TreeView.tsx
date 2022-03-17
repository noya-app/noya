import React, {
  memo,
  ReactNode,
  forwardRef,
  useContext,
  ForwardedRef,
} from 'react';

import { usePressableHandler } from 'noya-react-utils';
import type { ListViewRowProps } from './ListView';
import { IconButton } from './Button';
import * as ListView from './ListView';
import { Layout } from './Layout';

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

  const handleClickChevron = usePressableHandler(
    (event) => {
      event.stopPropagation();
      onClickChevron?.({ altKey: false /* event.altKey */ });
    },
    [onClickChevron],
  );

  return (
    <ListView.Row ref={forwardedRef} {...rest}>
      {expandable && (
        <>
          {expanded === undefined ? (
            <Layout.Queue size={15} />
          ) : (
            <IconButton
              name={expanded ? 'chevron-down' : 'chevron-right'}
              onClick={handleClickChevron}
              selected={rest.selected}
            />
          )}
          <Layout.Queue size={6} />
        </>
      )}
      {icon && (
        <>
          {icon}
          <Layout.Queue size={10} />
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
