import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import {
  Alpha,
  ColorModel,
  ColorPicker,
  equalColorObjects,
  hsvaToRgba,
  Hue,
  RgbaColor,
  rgbaToHsva,
  Saturation,
} from 'noya-colorpicker';
import { Fragment, memo, useMemo, useCallback } from 'react';
import useShallowArray from '../hooks/useShallowArray';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import withSeparatorElements from '../utils/withSeparatorElements';
import {
  Divider,
  InputField,
  Label,
  LabeledElementView,
  Spacer,
} from 'noya-designsystem';
import styled from 'styled-components';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const Column = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const Title = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  userSelect: 'none',
}));

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

const FullContent = styled.div(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  padding: '10px',
  fontSize: 14,
  color: 'black',
}));

const colorModel: ColorModel<RgbaColor> = {
  defaultColor: { r: 0, g: 0, b: 0, a: 1 },
  toHsva: rgbaToHsva,
  fromHsva: hsvaToRgba,
  equal: equalColorObjects,
};

interface ColorInputProps {
  id?: string;
  value: FileFormat.Color;
  onChange: (color: FileFormat.Color) => void;
}

interface Props {
  id: string;
  name?: string;
  color: Sketch.Color;
  hexValue?: string,
  onChangeColor: (color: Sketch.Color) => void;
  onChangeOpacity: (amount: number) => void;
  onNudgeOpacity: (amount: number) => void;
  onInputChange: (value: string) => void;
}

interface ColorProps {
  swatches: Sketch.Swatch[];
  index: number;
}

const ColorInputFieldFull = memo(function ColorInputFieldFull({ id, value, onChange }: ColorInputProps) {
  const rgbaColor: RgbaColor = useMemo(
    () => ({
      r: Math.floor(value.red * 255),
      g: Math.floor(value.green * 255),
      b: Math.floor(value.blue * 255),
      a: value.alpha,
    }),
    [value],
  );

  const handleChange = useCallback(
    (value: RgbaColor) => {
      onChange({
        _class: 'color',
        alpha: value.a,
        red: value.r / 255,
        green: value.g / 255,
        blue: value.b / 255,
      });
    },
    [onChange],
  );

  return (
    <FullContent>
      <ColorPicker
        colorModel={colorModel}
        color={rgbaColor}
        onChange={handleChange}
      >
        <Saturation />
        <Spacer.Vertical size={12} />
        <Hue />
        <Spacer.Vertical size={5} />
        <Alpha />
      </ColorPicker>
    </FullContent>
  );
});

const ColorSelectRow = memo(function ColorSelectRow({
  id,
  name = "New Color Variable",
  color,
  hexValue = 'FFFFFF',
  onChangeColor,
  onChangeOpacity,
  onNudgeOpacity,
  onInputChange
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case opacityInputId:
          return <Label.Label>Opacity</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, opacityInputId],
  );

  const handleSubmitOpacity = useCallback(
    (opacity: number) => {
      onChangeOpacity(opacity / 100);
    },
    [onChangeOpacity],
  );

  const handleNudgeOpacity = useCallback(
    (amount: number) => {
      onNudgeOpacity(amount / 100);
    },
    [onNudgeOpacity],
  );

  return (
    <Column>
      <InputField.Root  id={'colorName'}>
          <InputField.Input 
            value   = {name === "New Color Variable" || name === "Multiple" ? '' : name} 
            placeholder = {name}
            onChange = {onInputChange} 
          />
      </InputField.Root >
      <ColorInputFieldFull
            id={colorInputId}
            value={color}
            onChange={onChangeColor}
      />
      <Row id={id}>
        <LabeledElementView renderLabel={renderLabel}>
          <Spacer.Vertical size={8} />
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input value={hexValue} onSubmit={() => {}} />
            <InputField.Label>#</InputField.Label>
          </InputField.Root>
          <Spacer.Horizontal size={8} />
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(color.alpha * 100)}
              onSubmit={handleSubmitOpacity}
              onNudge={handleNudgeOpacity}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        </LabeledElementView>
      </Row>
    </Column>
  );
});


const ColorPickerInspector =  memo(function ColorPickerInspector({swatches, index}: ColorProps) {
  const [, dispatch] = useApplicationState();
  const swatch: Sketch.Swatch = swatches[0];

  const color = swatch.value as Sketch.Color;
  const rgbObj = {
    "r": Math.round(color.red   * 255),
    "g": Math.round(color.green * 255),
    "b": Math.round(color.blue  * 255)
  }

  function rgb2hex(rgb: string){
    const rgba = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    const hex = (rgba && rgba.length === 4) ? "#" +
    ("0" + parseInt(rgba[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgba[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgba[3],10).toString(16)).slice(-2) : '';

    return hex.toUpperCase();
  }
  const rgb: string = `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})`;

  const name = swatch.name !== 'Undefined' ? swatch.name 
      : (swatches.length > 1) ? "Multiple" : undefined ;
        
  return (
      <Container>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title>{"Name"}</Title>
          <Spacer.Horizontal size={12}/>
        </div>
        <ColorSelectRow
          id    = {`fill-${index}`}
          color = {color}
          name  = {name}
          hexValue = {rgb2hex(rgb)}
          onChangeOpacity={(value) =>
            console.log(value)
          }
          onNudgeOpacity={(value) =>
            console.log(value)
          }
          onChangeColor={(value) => 
            swatches.forEach(swatch => {
              dispatch('setSwatchColor', swatch.do_objectID, value)
            })
          }
          onInputChange={(value) => 
            swatches.forEach(swatch => {
              dispatch('setSwatchName', swatch.do_objectID, value)
            })
          }
        />
    </Container>
  );
});


export default memo(function SwatchesInspector() {  
  const currentTab = useSelector(Selectors.getCurrentTab);

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedSwatches),
  );

  const elements = useMemo(() => {
    const views = [
      <Fragment key="layout">
        <ColorPickerInspector 
          swatches={selectedSwatches} 
          index={0}
        />
        <Spacer.Vertical size={10} />
      </Fragment>,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [selectedSwatches, currentTab]);
    
    if (!(currentTab==="components") || selectedSwatches.length === 0){
      return null;
    }

    return <>{elements}</>;
  });
  