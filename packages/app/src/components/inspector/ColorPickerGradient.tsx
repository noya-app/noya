import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import {
  Spacer,
  RadioGroup,
  Select,
  ListView,
  Button,
  Divider,
  ContextMenu,
  getGradientBackground,
} from 'noya-designsystem';
import React, { memo, useState, useCallback, ForwardedRef } from 'react';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import {
  PaddedSection,
  GridSmall,
  Row,
  RadioGroupContainer,
  Square,
} from './ColorPickerSwatches';

export type MenuItemType = 'rename' | 'delete';

export const menuItems: MenuItem<MenuItemType>[] = [
  { value: 'rename', title: 'Rename' },
  { value: 'delete', title: 'Delete' },
];

type SwatchLayout = 'list' | 'grid';

interface GridsProps {
  gradients: Sketch.GradientAsset[];
  gradientType: Sketch.GradientType;
  onSelectGradientAsset: (gradient: Sketch.Gradient) => void;
  setGradientId: (id: string) => void;
  onContextMenu: (event?: React.MouseEvent) => void;
}

const SwatchesList = memo(function SwatchesList({
  gradients,
  gradientType,
  onSelectGradientAsset,
  setGradientId,
  onContextMenu,
}: GridsProps) {
  return (
    <ListView.Root>
      {gradients.map(({ do_objectID, gradient, name }) => {
        const colorString = getGradientBackground(
          gradient.stops,
          gradientType,
          180,
        );
        const handleContextMenu = () => {
          onContextMenu();
          setGradientId(do_objectID);
        };

        return (
          <ListView.Row
            id={do_objectID}
            onContextMenu={handleContextMenu}
            key={do_objectID}
            onClick={() => onSelectGradientAsset(gradient)}
          >
            <Square background={colorString} />
            <Spacer.Horizontal size={8} />
            {name}
          </ListView.Row>
        );
      })}
    </ListView.Root>
  );
});

const SwatchesGrid = memo(function SwatchesGrid({
  gradients,
  gradientType,
  onSelectGradientAsset,
  setGradientId,
  onContextMenu,
}: GridsProps) {
  return (
    <GridSmall>
      {gradients.map(({ do_objectID, gradient }) => {
        const gridString = getGradientBackground(
          gradient.stops,
          gradientType,
          180,
        );

        return (
          <GridItem
            key={do_objectID}
            background={gridString}
            handleClick={() => onSelectGradientAsset(gradient)}
            onContextMenu={(event: React.MouseEvent) => {
              setGradientId(do_objectID);
              onContextMenu(event);
            }}
          />
        );
      })}
    </GridSmall>
  );
});

const GridItem = memo(
  React.forwardRef(
    (
      {
        background,
        handleClick,
        onContextMenu,
      }: {
        background: string;
        handleClick: () => void;
        onContextMenu: (event: React.MouseEvent) => void;
      },
      forwardedRef: ForwardedRef<HTMLDivElement>,
    ) => (
      <Square
        ref={forwardedRef}
        background={background}
        onContextMenu={onContextMenu}
        onClick={handleClick}
      />
    ),
  ),
);

interface Props {
  gradientType: Sketch.GradientType;
  gradientAssets: Sketch.GradientAsset[];
  onCreate: () => void;
  onChange?: (gradient: Sketch.Gradient) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default memo(function ColorPickerGradients({
  gradientType,
  gradientAssets,
  onChange,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [gradientLayout, setGradientLayout] = useState<SwatchLayout>('grid');
  const [gradientId, setGradientId] = useState('');

  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'rename': {
          const name = prompt('New name?');
          if (!name) return;
          onRename(gradientId, name);
          break;
        }
        case 'delete': {
          onDelete(gradientId);
          break;
        }
      }
    },
    [gradientId, onRename, onDelete],
  );

  if (!onChange) return null;

  return (
    <>
      <PaddedSection>
        <Button id={'crete-theme-gradient'} onClick={onCreate}>
          Create Theme Gradient
        </Button>
      </PaddedSection>
      <Divider />
      <PaddedSection>
        <Row>
          <Select
            id="gradient-category"
            options={['Document']}
            value="Document"
            onChange={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <RadioGroupContainer>
            <RadioGroup.Root
              id={'gradients-layout'}
              value={gradientLayout}
              onValueChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setGradientLayout(event.target.value as SwatchLayout)
              }
            >
              <RadioGroup.Item value="grid" tooltip="Grid">
                <GridIcon />
              </RadioGroup.Item>
              <RadioGroup.Item value="list" tooltip="List">
                <RowsIcon />
              </RadioGroup.Item>
            </RadioGroup.Root>
          </RadioGroupContainer>
        </Row>
      </PaddedSection>
      <PaddedSection>
        <ContextMenu.Root<MenuItemType>
          items={menuItems}
          onSelect={handleSelectMenuItem}
        >
          {gradientLayout === 'grid' ? (
            <SwatchesGrid
              gradients={gradientAssets}
              gradientType={gradientType}
              setGradientId={setGradientId}
              onContextMenu={() => {}}
              onSelectGradientAsset={onChange}
            />
          ) : (
            <SwatchesList
              gradients={gradientAssets}
              gradientType={gradientType}
              setGradientId={setGradientId}
              onContextMenu={() => {}}
              onSelectGradientAsset={onChange}
            />
          )}
        </ContextMenu.Root>
      </PaddedSection>
    </>
  );
});
