import React, {
  memo,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { Spacer, ContextMenu, Divider } from '..';

const Grid = styled.div(({ theme }) => ({
  color: theme.colors.text,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 250px)',
  gridAutoRows: '170px',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '20px',
}));

const ScrollArea = styled.div(({ theme }) => ({
  flex: '1 1 0px', // Ignore the grid's intrinsic height
  display: 'flex',
  overflowY: 'auto',
  flexDirection: 'column',
}));

const Container = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
}));

const ItemContainer = styled.div<{ selected: boolean }>(
  ({ theme, selected }) => ({
    display: 'flex',
    flex: '1',
    backgroundColor: theme.colors.sidebar.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    cursor: 'pointer',
    border: `2px ${selected ? 'solid' : 'none'} rgb(132,63,255)`,
  }),
);

const GridContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const ItemTitle = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.text,
  fontWeight: 500,
  userSelect: 'none',
  whiteSpace: 'pre',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const ItemDescription = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
  userSelect: 'none',
  whiteSpace: 'pre',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const SectionTitle = styled.span<{ last?: boolean }>(
  ({ theme, last = false }) => ({
    ...theme.textStyles.body,
    color: last ? theme.colors.text : theme.colors.textMuted,
    fontWeight: 500,
    userSelect: 'none',
    whiteSpace: 'pre',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
);

const SectionHeaderContainer = styled.div(({ theme }) => ({
  padding: '0 20px',
}));

interface ItemProps<MenuItemType extends string = string> {
  id: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick?: (event: React.MouseEvent) => void;
  children?: ReactNode;
  menuItems?: ContextMenu.MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
}

const GridViewItem = forwardRef(function GridViewItem<
  MenuItemType extends string
>(
  {
    id,
    title,
    subtitle,
    selected,
    onClick,
    children,
    menuItems,
    onSelectMenuItem,
    onContextMenu,
  }: ItemProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      onClick?.(event);
    },
    [onClick],
  );

  const element = (
    <GridContainer id={id} ref={forwardedRef}>
      <ItemContainer
        selected={selected}
        onClick={handleClick}
        onContextMenu={onContextMenu}
      >
        {children}
      </ItemContainer>
      <Spacer.Vertical size={8} />
      <ItemTitle>{title || ' '}</ItemTitle>
      <ItemDescription>{subtitle || ' '}</ItemDescription>
    </GridContainer>
  );

  if (menuItems) {
    return (
      <ContextMenu.Root<MenuItemType>
        items={menuItems}
        onSelect={onSelectMenuItem}
      >
        {element}
      </ContextMenu.Root>
    );
  }

  return element;
});

interface GridViewRootProps {
  children?: ReactNode;
  onClick?: () => void;
}

function GridViewRoot({ children, onClick }: GridViewRootProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      onClick?.();
    },
    [onClick],
  );

  return (
    <Container onClick={handleClick}>
      <ScrollArea>{children}</ScrollArea>
    </Container>
  );
}

function GridViewSection({ children }: { children?: ReactNode }) {
  return <Grid>{children}</Grid>;
}

interface GridViewSectionHeaderProps {
  title: string;
}

function GridViewSectionHeader({ title }: GridViewSectionHeaderProps) {
  const groupedTitle = title.split('/');

  return (
    <SectionHeaderContainer>
      {groupedTitle.map((title, index) => {
        const lastText = index === groupedTitle.length - 1;
        return (
          <>
            <SectionTitle last={lastText}>{title}</SectionTitle>
            {!lastText && <SectionTitle> / </SectionTitle>}
          </>
        );
      })}
      <Spacer.Vertical size={8} />
      <Divider />
    </SectionHeaderContainer>
  );
}

export const Root = memo(GridViewRoot);
export const Item = memo(GridViewItem);
export const Section = memo(GridViewSection);
export const SectionHeader = memo(GridViewSectionHeader);
