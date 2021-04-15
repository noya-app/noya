import { memo, forwardRef, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { Spacer, ContextMenu } from '..';

const Grid = styled.div(({ theme }) => ({
  flex: 1,
  color: theme.colors.text,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 250px)',
  gridAutoRows: '170px',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '20px',
  overflowY: 'auto',
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

type MenuItemType = 'delete' | 'copy';

interface ItemProps {
  title?: string;
  subtitle?: string;
  selected: boolean;
  onClick?: (event: React.MouseEvent) => void;
  children?: ReactNode;
  menuItems?: ContextMenu.MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
}

const GridItem = memo(
  forwardRef(function GridItem({
    title,
    subtitle,
    selected,
    onClick,
    children,
    menuItems,
    onSelectMenuItem,
    onContextMenu,
  }: ItemProps) {
    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        onClick?.(event);
      },
      [onClick],
    );

    const element = (
      <GridContainer>
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
  }),
);

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
      <ScrollArea>
        <Grid>{children}</Grid>
      </ScrollArea>
    </Container>
  );
}

export const Root = memo(GridViewRoot);
export const Item = memo(GridItem);
