import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Spacer,
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
  Square,
  LayoutType,
  LayoutPicker,
} from './ColorPickerAssetGrid';

export type MenuItemType = 'rename' | 'delete';

export const menuItems: MenuItem<MenuItemType>[] = [
  { value: 'rename', title: 'Rename' },
  { value: 'delete', title: 'Delete' },
];

interface GridsProps {
  gradients: Sketch.GradientAsset[];
  handleSelectMenuItem: (value: MenuItemType) => void;
  onSelectGradientAsset: (gradient: Sketch.Gradient) => void;
  setGradientId: (id: string) => void;
}

const GradientsList = memo(function GradientsList({
  gradients,
  setGradientId,
  handleSelectMenuItem,
  onSelectGradientAsset,
}: GridsProps) {
  return (
    <ListView.Root>
      {gradients.map(({ do_objectID, gradient, name }) => {
        const colorString = getGradientBackground(
          gradient.stops,
          gradient.gradientType,
          180,
        );

        return (
          <ContextMenu.Root<MenuItemType>
            items={menuItems}
            onSelect={handleSelectMenuItem}
          >
            <ListView.Row
              key={do_objectID}
              id={do_objectID}
              onContextMenu={() => setGradientId(do_objectID)}
              onClick={() => onSelectGradientAsset(gradient)}
            >
              <Square background={colorString} />
              <Spacer.Horizontal size={8} />
              {name}
            </ListView.Row>
          </ContextMenu.Root>
        );
      })}
    </ListView.Root>
  );
});

const GradientsGrid = memo(function GradientsGrid({
  gradients,
  setGradientId,
  handleSelectMenuItem,
  onSelectGradientAsset,
}: GridsProps) {
  return (
    <GridSmall>
      {gradients.map(({ do_objectID, gradient }) => {
        const gridString = getGradientBackground(
          gradient.stops,
          gradient.gradientType,
          180,
        );

        return (
          <ContextMenu.Root<MenuItemType>
            items={menuItems}
            onSelect={handleSelectMenuItem}
          >
            <GridItem
              key={do_objectID}
              background={gridString}
              handleClick={() => onSelectGradientAsset(gradient)}
              onContextMenu={() => setGradientId(do_objectID)}
            />
          </ContextMenu.Root>
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
        onContextMenu: () => void;
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
  gradientType?: Sketch.GradientType;
  gradientAssets: Sketch.GradientAsset[];
  onCreate: () => void;
  onChange?: (gradient: Sketch.Gradient) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default memo(function ColorPickerGradients({
  gradientAssets,
  onChange,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [gradientLayout, setGradientLayout] = useState<LayoutType>('grid');
  const [gradientId, setGradientId] = useState('');

  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'rename': {
          const name = prompt('New Gradient Name');
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
          <LayoutPicker layout={gradientLayout} setLayout={setGradientLayout} />
        </Row>
      </PaddedSection>
      <PaddedSection>
        {gradientLayout === 'grid' ? (
          <GradientsGrid
            gradients={gradientAssets}
            setGradientId={setGradientId}
            handleSelectMenuItem={handleSelectMenuItem}
            onSelectGradientAsset={onChange}
          />
        ) : (
          <GradientsList
            gradients={gradientAssets}
            setGradientId={setGradientId}
            handleSelectMenuItem={handleSelectMenuItem}
            onSelectGradientAsset={onChange}
          />
        )}
      </PaddedSection>
    </>
  );
});
