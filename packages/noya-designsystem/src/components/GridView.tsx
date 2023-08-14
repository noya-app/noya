import React, {
  createContext,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import styled from 'styled-components';
import { useHover } from '../hooks/useHover';
import withSeparatorElements from '../utils/withSeparatorElements';
import { ContextMenu } from './ContextMenu';
import { MenuItem } from './internal/Menu';
import { ScrollArea } from './ScrollArea';
import { Spacer } from './Spacer';

export type GridViewSize = 'xs' | 'small' | 'large';

const Grid = styled.div<{
  size: GridViewSize;
  padding: CSSProperties['padding'];
}>(({ theme, size, padding }) => {
  return {
    color: theme.colors.text,
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(
      ${size === 'large' ? '280px' : size === 'small' ? '160px' : '87px'}
    , 1fr))`,
    gridAutoRows:
      size === 'large' ? '280px' : size === 'small' ? '170px' : '87px',
    gap: size === 'large' || size === 'small' ? `20px` : `9px`,
    // gridTemplateColumns: `repeat(auto-fill, minmax(
    //   ${size === 'large' ? '280px' : size === 'small' ? '160px' : '116px'}
    // , 1fr))`,
    // gridAutoRows:
    //   size === 'large' ? '280px' : size === 'small' ? '170px' : '116px',
    // gap: size === 'large' || size === 'small' ? `20px` : `12px`,
    padding,
  };
});

const Container = styled.div<{ scrollable: boolean }>(
  ({ theme, scrollable }) => ({
    flex: scrollable ? '1' : '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
  }),
);

const ItemContainer = styled.div<{ selected?: boolean; bordered: boolean }>(
  ({ theme, selected, bordered }) => ({
    display: 'flex',
    flex: '1',
    backgroundColor: theme.colors.sidebar.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '2px',
    border: `1px solid ${
      selected
        ? theme.colors.primary
        : bordered
        ? theme.colors.divider
        : 'transparent'
    }`,
    overflow: 'hidden',

    cursor: 'pointer',
    '&:hover': {
      opacity: 0.85,
    },
    '&:active': {
      opacity: 0.7,
    },
  }),
);

const GridContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ItemTitle = styled.span<{ showBackground: boolean }>(
  ({ theme, showBackground }) => ({
    ...theme.textStyles.small,
    color: theme.colors.text,
    fontWeight: 500,
    userSelect: 'none',
    whiteSpace: 'pre',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    ...(showBackground && {
      background: theme.colors.sidebar.background,
      // border: `1px solid ${theme.colors.dividerSubtle}`,
      padding: '2px 4px',
      borderRadius: '2px',
      backdropFilter: 'blur(4px)',
    }),
  }),
);

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
    ...theme.textStyles.heading3,
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

const TextOverlay = styled.div({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'end',
  padding: '4px',
  pointerEvents: 'none',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

interface ItemProps<MenuItemType extends string = string> {
  id: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  children?: ReactNode;
  menuItems?: MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
}

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
    onHoverChange,
    children,
    menuItems,
    onSelectMenuItem,
    onContextMenu,
  }: ItemProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [hovered, setHovered] = React.useState(false);

  const { hoverProps } = useHover({
    onHoverChange: (isHovering) => {
      onHoverChange?.(isHovering);
      setHovered(isHovering);
    },
  });

  const { textPosition, bordered } = useContext(GridViewContext);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      onClick?.(event);
    },
    [onClick],
  );

  const element = (
    <GridContainer id={id} ref={forwardedRef} {...hoverProps}>
      <ItemContainer
        bordered={bordered}
        selected={selected}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      >
        {children}
      </ItemContainer>
      {textPosition === 'below' && (
        <>
          <Spacer.Vertical size={8} />
          <ItemTitle showBackground={false}>{title || ' '}</ItemTitle>
          <ItemDescription>{subtitle || ' '}</ItemDescription>
        </>
      )}
      {textPosition === 'overlay' && hovered && (
        <TextOverlay>
          <ItemTitle showBackground={true}>{title}</ItemTitle>
          <ItemDescription>{subtitle}</ItemDescription>
        </TextOverlay>
      )}
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

type GridViewContextValue = {
  size: GridViewSize;
  textPosition: 'overlay' | 'below';
  bordered: boolean;
};

const GridViewContext = createContext<GridViewContextValue>({
  size: 'small',
  textPosition: 'below',
  bordered: false,
});

interface GridViewRootProps extends Partial<GridViewContextValue> {
  children: ReactNode;
  onClick?: () => void;
  scrollable?: boolean;
}

function GridViewRoot({
  size = 'small',
  children,
  scrollable = true,
  onClick,
  textPosition = 'below',
  bordered = false,
}: GridViewRootProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      onClick?.();
    },
    [onClick],
  );

  const contextValue = useMemo(
    () => ({
      size,
      textPosition,
      bordered,
    }),
    [bordered, size, textPosition],
  );

  return (
    <GridViewContext.Provider value={contextValue}>
      <Container onClick={handleClick} scrollable={scrollable}>
        {scrollable ? <ScrollArea>{children}</ScrollArea> : children}
      </Container>
    </GridViewContext.Provider>
  );
}

function GridViewSection({
  children,
  padding = '20px',
}: {
  children?: ReactNode;
  padding?: CSSProperties['padding'];
}) {
  const { size } = useContext(GridViewContext);

  return (
    <Grid size={size} padding={padding}>
      {children}
    </Grid>
  );
}

function GridViewSectionHeader({ title }: { title: string }) {
  const grouped = title.split('/');

  return (
    <SectionHeaderContainer>
      <Spacer.Vertical size={12} />
      {withSeparatorElements(
        grouped.map((title, index) => (
          <SectionTitle last={index === grouped.length - 1}>
            {title}
          </SectionTitle>
        )),
        <SectionTitle> / </SectionTitle>,
      )}
      <Spacer.Vertical size={8} />
    </SectionHeaderContainer>
  );
}

export namespace GridView {
  export const Root = memo(GridViewRoot);
  export const Item = memo(GridViewItem);
  export const Section = memo(GridViewSection);
  export const SectionHeader = memo(GridViewSectionHeader);
}
