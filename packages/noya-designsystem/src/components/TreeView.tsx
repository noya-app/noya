import React, {
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
} from 'react';
import { IconButton } from './IconButton';
import { ListView } from './ListView';
import { Spacer } from './Spacer';

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

type TreeRowBaseProps = {
  icon?: ReactNode;
  expanded?: boolean;
  onClickChevron?: ({ altKey }: { altKey: boolean }) => void;
};

type TreeViewRowProps<MenuItemType extends string> =
  ListView.RowProps<MenuItemType> & TreeRowBaseProps;

const TreeRow = forwardRef(function TreeRow<MenuItemType extends string>(
  {
    icon,
    expanded,
    onClickChevron,
    children,
    ...rest
  }: TreeViewRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLLIElement>,
) {
  const { expandable } = useContext(ListView.RowContext);

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

export namespace TreeView {
  export const Root = ListView.Root;
  export const RowTitle = ListView.RowTitle;
  export const EditableRowTitle = ListView.EditableRowTitle;
  export const Row = memo(TreeRow);
  export type ClickInfo = ListView.ClickInfo;
  export type RowProps<MenuItemType extends string> =
    TreeViewRowProps<MenuItemType>;
}
