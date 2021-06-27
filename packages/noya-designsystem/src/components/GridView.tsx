import React, {
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { ContextMenu, Divider, MenuItem, ScrollArea, Spacer } from '..';
import withSeparatorElements from '../utils/withSeparatorElements';

const Grid = styled.div(({ theme }) => ({
  color: theme.colors.text,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 250px)',
  gridAutoRows: '170px',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '20px',
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
    border: `2px solid ${selected ? theme.colors.primary : 'transparent'}`,
    overflow: 'hidden',
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
  menuItems?: MenuItem<MenuItemType>[];
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
      <ContextMenu<MenuItemType> items={menuItems} onSelect={onSelectMenuItem}>
        {element}
      </ContextMenu>
    );
  }

  return element;
});

interface GridViewRootProps {
  children: ReactNode;
  onClick: () => void;
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

function GridViewSectionHeader({ title }: { title: string }) {
  const grouped = title.split('/');

  return (
    <SectionHeaderContainer>
      {withSeparatorElements(
        grouped.map((title, index) => (
          <SectionTitle last={index === grouped.length - 1}>
            {title}
          </SectionTitle>
        )),
        <SectionTitle> / </SectionTitle>,
      )}
      <Spacer.Vertical size={8} />
      <Divider />
    </SectionHeaderContainer>
  );
}

export const Root = memo(GridViewRoot);
export const Item = memo(GridViewItem);
export const Section = memo(GridViewSection);
export const SectionHeader = memo(GridViewSectionHeader);
