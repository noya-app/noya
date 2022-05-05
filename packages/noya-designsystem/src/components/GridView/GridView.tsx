import React, {
  memo,
  useContext,
  forwardRef,
  useCallback,
  ForwardedRef,
  createContext,
} from 'react';
import styled from 'styled-components';

import withSeparatorElements from '../../utils/withSeparatorElements';
import ContextMenu from '../ContextMenu';
import ScrollArea from '../ScrollArea';
import { Layout } from '../Layout';
import type {
  ItemProps,
  GridProps,
  GridViewVariant,
  SectionTitleProps,
  GridViewRootProps,
  ItemContainerProps,
  GridViewSectionProps,
  GridViewSectionHeaderProps,
} from './types';

const Grid = styled.div<GridProps>(({ theme, variant }) => ({
  color: theme.colors.text,
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, ${
    variant === 'large' ? 280 : 250
  }px)`,
  gridAutoRows: variant === 'large' ? '280px' : '170px',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '20px',
}));

const Container = styled.div({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
});

const ItemContainer = styled.div<ItemContainerProps>(({ theme, selected }) => ({
  display: 'flex',
  flex: '1',
  backgroundColor: theme.colors.sidebar.background,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '12px',
  border: `2px solid ${selected ? theme.colors.primary : 'transparent'}`,
  overflow: 'hidden',
}));

const GridContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

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

const SectionTitle = styled.span<SectionTitleProps>(
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

const SectionHeaderContainer = styled.div({
  padding: '0 20px',
});

const GridViewItem = forwardRef(function GridViewItem<
  MenuItemType extends string,
>(
  {
    id,
    title,
    subtitle,
    selected,
    onClick,
    onDoubleClick,
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
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      >
        {children}
      </ItemContainer>
      <Layout.Stack size={8} />
      <ItemTitle>{title || ' '}</ItemTitle>
      <ItemDescription>{subtitle || ' '}</ItemDescription>
    </GridContainer>
  );

  if (menuItems && onSelectMenuItem) {
    return (
      <ContextMenu<MenuItemType> items={menuItems} onSelect={onSelectMenuItem}>
        {element}
      </ContextMenu>
    );
  }

  return element;
});

const GridViewContext = createContext<GridViewVariant>('small');

function GridViewRoot({ variant, children, onClick }: GridViewRootProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      onClick?.();
    },
    [onClick],
  );

  return (
    <GridViewContext.Provider value={variant ?? 'small'}>
      <Container onClick={handleClick}>
        <ScrollArea>{children}</ScrollArea>
      </Container>
    </GridViewContext.Provider>
  );
}

function GridViewSection({ children }: GridViewSectionProps) {
  const variant = useContext(GridViewContext);

  return <Grid variant={variant}>{children}</Grid>;
}

function GridViewSectionHeader({ title }: GridViewSectionHeaderProps) {
  const grouped = title.split('/');

  return (
    <SectionHeaderContainer>
      <Layout.Stack size={12} />
      {withSeparatorElements(
        grouped.map((title, index) => (
          <SectionTitle last={index === grouped.length - 1}>
            {title}
          </SectionTitle>
        )),
        <SectionTitle> / </SectionTitle>,
      )}
      <Layout.Stack size={8} />
      <Layout.Divider />
    </SectionHeaderContainer>
  );
}

export const Root = memo(GridViewRoot);
export const Item = memo(GridViewItem);
export const Section = memo(GridViewSection);
export const SectionHeader = memo(GridViewSectionHeader);
