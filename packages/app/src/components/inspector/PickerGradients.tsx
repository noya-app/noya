import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Spacer,
  Select,
  ListView,
  Button,
  Divider,
  ContextMenu,
  getGradientBackground,
  MenuItem,
} from 'noya-designsystem';
import { memo, useState, useCallback } from 'react';
import {
  PaddedSection,
  GridSmall,
  Row,
  Square,
  LayoutType,
  LayoutPicker,
} from './PickerAssetGrid';

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
          <ContextMenu<MenuItemType>
            key={do_objectID}
            items={menuItems}
            onSelect={handleSelectMenuItem}
          >
            <ListView.Row
              id={do_objectID}
              onContextMenu={() => setGradientId(do_objectID)}
              onClick={() => onSelectGradientAsset(gradient)}
            >
              <Square background={colorString} />
              <Spacer.Horizontal size={8} />
              {name}
            </ListView.Row>
          </ContextMenu>
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
          <ContextMenu<MenuItemType>
            key={do_objectID}
            items={menuItems}
            onSelect={handleSelectMenuItem}
          >
            <Square
              background={gridString}
              onContextMenu={() => setGradientId(do_objectID)}
              onClick={() => onSelectGradientAsset(gradient)}
            />
          </ContextMenu>
        );
      })}
    </GridSmall>
  );
});

interface Props {
  gradientAssets: Sketch.GradientAsset[];
  onCreate: () => void;
  onChange: (gradient: Sketch.Gradient) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default memo(function PickerGradients({
  gradientAssets,
  onChange,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [gradientLayout, setGradientLayout] = useState<LayoutType>('grid');
  const [gradientId, setGradientId] = useState<string | undefined>(undefined);

  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      if (!gradientId) return;
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
