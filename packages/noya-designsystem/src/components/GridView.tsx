import { memo, useCallback, ReactNode } from 'react';
import styled from 'styled-components';

const Grid = styled.div(({ theme }) => ({
  flex: 1,
  color: theme.colors.text,
  display: 'grid',
  padding: '14px',
  gridTemplateColumns: 'repeat(auto-fill, 200px)',
  gridTemplateRows: 'repeat(auto-fill, 180px)', // Makes it go
  justifyContent: 'space-between',
  gap: '20px',
  overflowY: 'scroll',
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
    width: '200px',
    height: '130px',
    backgroundColor: theme.colors.sidebar.background,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    borderRadius: '12px',
    cursor: 'pointer',
    border: `2px ${selected ? 'solid' : 'none'} rgb(132,63,255)`,
  }),
);

const SwatchContainer = styled.div(({ theme }) => ({
  heigth: '180px',
}));

const ItemTitle = styled.span(({ theme }) => ({
  color: theme.colors.textDecorativeLight,
  margin: '0px',
}));

const ItemDescription = styled.div(({ theme }) => ({
  color: theme.colors.text,
  margin: '0px',
}));

interface ItemProps {
  children?: ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

function GridItem({ children, title, subtitle, selected, onClick }: ItemProps) {
  return (
    <SwatchContainer>
      <ItemContainer onClick={onClick} selected={selected}>
        {children}
      </ItemContainer>
      <ItemTitle>{title}</ItemTitle>
      <ItemDescription>{subtitle}</ItemDescription>
    </SwatchContainer>
  );
}

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
