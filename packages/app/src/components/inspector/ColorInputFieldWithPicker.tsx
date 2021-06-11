import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import {
  ColorInputField,
  Divider,
  RadioGroup,
  Select,
  Spacer,
  sketchColorToRgbaString,
  ListView,
  Button,
} from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import ColorInspector from './ColorInspector';
import GradientInspector from './GradientInspector';
import { uuid } from 'noya-renderer';
import GradientInputField from 'noya-designsystem/src/components/GradientInputField';

const Content = styled(Popover.Content)(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  maxHeight: '600px',
  overflowY: 'auto',
}));

const StyledArrow = styled(Popover.Arrow)(({ theme }) => ({
  fill: theme.colors.popover.background,
}));

const PaddedSection = styled.section({
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
});

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
}));

const RadioGroupContainer = styled.div({
  flex: '0 0 50px',
  display: 'flex',
  alignItems: 'stretch',
});

const Square = styled.div<{ color: string; selected?: boolean }>(
  ({ theme, color, selected = false }) => ({
    height: '25px',
    width: '25px',
    backgroundColor: color,
    border: `2px solid ${
      selected ? 'rgb(132,63,255)' : theme.colors.popover.background
    } `,
    borderRadius: '4px',
    cursor: 'pointer',
  }),
);

const GridSmall = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 25px)',
  gap: '5px',
});

type SwatchLayout = 'list' | 'grid';
type FillOption =
  | 'Solid Color'
  | 'Linear Gradient'
  | 'Radial Gradient'
  | 'Angular Gradient'
  | 'Pattern Fill';

export type SketchPattern = {
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};

interface Props {
  id?: string;
  value: Sketch.Color | Sketch.Gradient | SketchPattern;
  onChange: (color: Sketch.Color) => void;
  onChangeType?: (type: Sketch.FillType) => void;
  onChangeGradientColor?: (color: Sketch.Color, index: number) => void;
  onChangeGradientType?: (type: Sketch.GradientType) => void;
  onChangeGradientPosition?: (index: number, position: number) => void;
  onAddGradientStop?: (color: Sketch.Color, position: number) => void;
}

interface SwatchesProps {
  selectedSwatchId?: string;
  swatches: Sketch.Swatch[];
  onSelectSwatch: (color: Sketch.Color) => void;
}

const SwatchesList = memo(function SwatchesList({
  selectedSwatchId,
  swatches,
  onSelectSwatch,
}: SwatchesProps) {
  return (
    <ListView.Root>
      {swatches.map((item) => {
        const colorString = sketchColorToRgbaString(item.value);

        return (
          <ListView.Row
            id={item.do_objectID}
            key={item.do_objectID}
            selected={selectedSwatchId === item.do_objectID}
            onClick={() => {
              onSelectSwatch({
                ...item.value,
                swatchID: item.do_objectID,
              });
            }}
          >
            <Square color={colorString} />
            <Spacer.Horizontal size={8} />
            {item.name}
          </ListView.Row>
        );
      })}
    </ListView.Root>
  );
});

const SwatchesGrid = memo(function SwatchesGrid({
  selectedSwatchId,
  swatches,
  onSelectSwatch,
}: SwatchesProps) {
  return (
    <GridSmall>
      {swatches.map((item) => {
        const colorString = sketchColorToRgbaString(item.value);

        return (
          <Square
            key={item.do_objectID}
            color={colorString}
            selected={selectedSwatchId === item.do_objectID}
            onClick={() => {
              onSelectSwatch({
                ...item.value,
                swatchID: item.do_objectID,
              });
            }}
          />
        );
      })}
    </GridSmall>
  );
});

export default memo(function ColorInputFieldWithPicker({
  id,
  value,
  onChange,
  onChangeType,
  onChangeGradientColor,
  onChangeGradientPosition,
  onAddGradientStop,
  onChangeGradientType,
}: Props) {
  // TODO: The value prop here can be an array, and other
  // inspector rows may also take arrays

  const [state, dispatch] = useApplicationState();
  const [swatchLayout, setSwatchLayout] = useState<SwatchLayout>('grid');

  const values = useMemo(() => {
    if (value._class !== 'color')
      //change to show preview of gradient :thinking_emoji:
      return [];
    return [value];
  }, [value]);

  const selectedColor = values[0];

  const sharedSwatches = Selectors.getSharedSwatches(state);

  const isSwatch = useMemo(
    () =>
      selectedColor &&
      selectedColor.swatchID &&
      sharedSwatches.some((e) => e.do_objectID === selectedColor.swatchID),
    [selectedColor, sharedSwatches],
  );

  const detachThemeColor = useCallback(() => {
    onChange({
      ...selectedColor,
      swatchID: undefined,
    });
  }, [onChange, selectedColor]);

  const createThemeColor = useCallback(() => {
    const swatchName = prompt('New Swatch Name');
    if (!swatchName) return;

    const id = uuid();
    onChange({
      ...selectedColor,
      swatchID: id,
    });
    dispatch('addSwatch', swatchName, selectedColor, id);
  }, [onChange, dispatch, selectedColor]);

  const options: FillOption[] = useMemo(
    () => [
      'Solid Color',
      'Linear Gradient',
      'Radial Gradient',
      'Angular Gradient',
      'Pattern Fill',
    ],
    [],
  );

  const fillOption = useMemo(
    () =>
      value._class === 'color'
        ? 'Solid Color'
        : value._class !== 'gradient'
        ? 'Pattern Fill'
        : (`${
            Sketch.GradientType[
              value._class === 'gradient' ? value.gradientType : 0
            ]
          } Gradient` as FillOption),
    [value],
  );

  return (
    <Popover.Root>
      <Popover.Trigger as={Slot}>
        <ColorInputField
          id={id}
          value={value._class === 'color' ? values[0] : value}
        />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        <PaddedSection>
          <Row>
            <Select
              id="fill-options"
              value={fillOption}
              options={options}
              onChange={useCallback(
                (value: FillOption) => {
                  if (onChangeType)
                    onChangeType(
                      value.endsWith('Gradient')
                        ? Sketch.FillType.Gradient
                        : value === 'Pattern Fill'
                        ? Sketch.FillType.Pattern
                        : Sketch.FillType.Color,
                    );
                  if (value.endsWith('Gradient') && onChangeGradientType)
                    onChangeGradientType(
                      value === 'Linear Gradient'
                        ? Sketch.GradientType.Linear
                        : value === 'Radial Gradient'
                        ? Sketch.GradientType.Radial
                        : Sketch.GradientType.Angular,
                    );
                },
                [onChangeType, onChangeGradientType],
              )}
            />
          </Row>
        </PaddedSection>
        <PaddedSection>
          {value._class === 'color' ? (
            <ColorInspector
              id={`${id}-color-inspector`}
              colors={values}
              onChangeColor={onChange}
            />
          ) : value._class === 'gradient' ? (
            <GradientInspector
              id={`${id}-gradient-inspector`}
              gradient={value.stops}
              onChangeColor={onChangeGradientColor}
              onChangePosition={onChangeGradientPosition}
              onAddStop={onAddGradientStop}
            />
          ) : (
            <></>
          )}
          <Spacer.Vertical size={12} />
          {isSwatch ? (
            <Button id={'detach-theme-color'} onClick={detachThemeColor}>
              Detach Theme Color
            </Button>
          ) : (
            <Button id={'crete-theme-color'} onClick={createThemeColor}>
              Create Theme Color
            </Button>
          )}
        </PaddedSection>
        <Divider />
        <PaddedSection>
          <Row>
            <Select
              id="colors-category"
              options={['Theme colors']}
              value="Theme colors"
              onChange={() => {}}
            />
            <Spacer.Horizontal size={8} />
            <RadioGroupContainer>
              <RadioGroup.Root
                id={'colors-layout'}
                value={swatchLayout}
                onValueChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSwatchLayout(event.target.value as SwatchLayout)
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
          {value._class !== 'pattern' ? (
            swatchLayout === 'grid' ? (
              <SwatchesGrid
                selectedSwatchId={selectedColor.swatchID}
                swatches={sharedSwatches}
                onSelectSwatch={onChange}
              />
            ) : (
              <SwatchesList
                selectedSwatchId={selectedColor.swatchID}
                swatches={sharedSwatches}
                onSelectSwatch={onChange}
              />
            )
          ) : (
            <>A</>
          )}
        </PaddedSection>
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
