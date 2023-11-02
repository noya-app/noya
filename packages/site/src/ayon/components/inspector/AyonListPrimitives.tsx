import {
  ActivityIndicator,
  IconButton,
  ListView,
  Spacer,
  Stack,
  Text,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { memo, useCallback } from 'react';
import styled from 'styled-components';
import { DraggableMenuButton } from './DraggableMenuButton';

const ExpandableIcon = styled(IconButton)({
  position: 'relative',
  // top: '-1px',
  // height: '24px',
  // margin: '-4px 0',
});

export const AyonListSectionHeader = memo(function AyonListSectionHeader({
  children,
  isExpanded,
  onChangeExpanded,
  right,
}: {
  children: React.ReactNode;
  isExpanded: boolean;
  onChangeExpanded: (value: boolean) => void;
  right?: React.ReactNode;
}) {
  const toggleIsExpanded = useCallback(() => {
    onChangeExpanded(!isExpanded);
  }, [isExpanded, onChangeExpanded]);

  return (
    <ListView.Row isSectionHeader backgroundColor="transparent" tabIndex={-1}>
      <Stack.H padding="12px 0 4px 0" gap="2px" flex="1" alignItems="center">
        <Text
          variant="label"
          color="textSubtle"
          fontWeight="bold"
          position="relative"
          top="1px"
        >
          {children}
        </Text>
        <ExpandableIcon
          iconName={isExpanded ? 'CaretDownIcon' : 'CaretRightIcon'}
          onClick={toggleIsExpanded}
        />
        {right && <Spacer.Horizontal />}
        {right}
      </Stack.H>
    </ListView.Row>
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RowProps<MenuItemType extends string> = {
  isLoading: boolean;
  isDragging: boolean;
  isEditing: boolean;
  name: string;
  content?: React.ReactNode;
  isSuggestedPage: boolean;
  handleSubmitEditing: (value: string) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
} & Omit<
  React.ComponentProps<typeof ListView.Row<MenuItemType>>,
  'backgroundColor' | 'depth' | 'disabled' | 'children'
>;

export const AyonListRow = memo(function AyonListRow<
  MenuItemType extends string,
>({
  isLoading,
  isDragging,
  isEditing,
  name,
  content,
  isSuggestedPage,
  handleSubmitEditing,
  onClickPlus,
  onClickTrash,
  ...props
}: RowProps<MenuItemType>) {
  const theme = useDesignSystemTheme();

  const [isHovered, setIsHovered] = React.useState(false);
  const hovered = props.hovered ?? isHovered;

  const borderColor =
    props.selected && hovered
      ? theme.colors.primaryLight
      : hovered
      ? theme.colors.primary
      : theme.colors.divider;

  return (
    <ListView.Row
      {...props}
      depth={0}
      backgroundColor="transparent"
      disabled={isLoading}
      onHoverChange={setIsHovered}
    >
      {props.menuItems && props.onSelectMenuItem && (
        <DraggableMenuButton
          isVisible
          items={props.menuItems}
          onSelect={props.onSelectMenuItem}
        />
      )}
      {props.menuItems && <Spacer.Horizontal size={8} />}
      <Stack.V
        flex="1 1 0%"
        padding="1px"
        borderRadius="4px"
        gap="2px"
        border={`1px solid ${borderColor}`}
        color={'inherit'}
        minWidth="0"
        background={
          isDragging
            ? 'transparent'
            : props.selected
            ? theme.colors.primary
            : 'transparent'
        }
      >
        <Stack.H padding="4px 6px" alignItems="center" gap="4px">
          {isEditing ? (
            <ListView.EditableRowTitle
              autoFocus
              value={name}
              onSubmitEditing={handleSubmitEditing}
            />
          ) : isLoading ? (
            <>
              <ListView.RowTitle>Loading...</ListView.RowTitle>
              <ActivityIndicator opacity={0.5} />
            </>
          ) : (
            <ListView.RowTitle>{name}</ListView.RowTitle>
          )}
          {content}
        </Stack.H>
      </Stack.V>
      {isSuggestedPage && !isLoading && !isDragging && (
        <>
          <Spacer.Horizontal size={8} />
          <IconButton
            iconName="PlusIcon"
            color={theme.colors.icon}
            onClick={onClickPlus}
          />
          <Spacer.Horizontal size={8} />
          <IconButton
            iconName="TrashIcon"
            color={theme.colors.icon}
            onClick={onClickTrash}
          />
        </>
      )}
    </ListView.Row>
  );
});
