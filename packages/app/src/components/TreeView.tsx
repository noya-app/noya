import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { ComponentProps, memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import * as ListView from './ListView';
import * as Spacer from './Spacer';

type TreeRowBaseProps = {
  icon?: ReactNode;
  depth: number;
};

/* ----------------------------------------------------------------------------
 * SectionHeader
 * ------------------------------------------------------------------------- */

const ChevronContainer = styled.span({
  display: 'flex',
  alignItems: 'center',
});

type TreeSectionHeaderProps = ComponentProps<typeof ListView['SectionHeader']> &
  TreeRowBaseProps & {
    expanded: boolean;
    onClickChevron?: () => void;
  };

function TreeSectionHeader({
  depth,
  icon,
  children,
  expanded,
  onClickChevron,
  ...rest
}: TreeSectionHeaderProps) {
  return (
    <ListView.SectionHeader {...rest}>
      <Spacer.Horizontal size={depth * 12} />
      <ChevronContainer
        onClick={useCallback(
          (event) => {
            event.stopPropagation();
            onClickChevron?.();
          },
          [onClickChevron],
        )}
      >
        {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </ChevronContainer>
      <Spacer.Horizontal size={6} />
      {icon && (
        <>
          {icon}
          <Spacer.Horizontal size={10} />
        </>
      )}
      {children}
    </ListView.SectionHeader>
  );
}

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

type TreeRowProps = ComponentProps<typeof ListView['Row']> & TreeRowBaseProps;

function TreeRow({ depth, icon, children, ...rest }: TreeRowProps) {
  return (
    <ListView.Row {...rest}>
      <Spacer.Horizontal size={depth * 12} />
      {/* Same width as the chevron */}
      <Spacer.Horizontal size={6 + 15} />
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
export const SectionHeader = memo(TreeSectionHeader);
(SectionHeader as any).isSectionHeader = true;
export type TreeViewClickInfo = ListView.ListViewClickInfo;
