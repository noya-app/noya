import {
  StretchHorizontallyIcon,
  StretchVerticallyIcon,
  SquareIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  PinBottomIcon,
  PinTopIcon,
  AlignCenterVerticallyIcon,
} from '@radix-ui/react-icons';
import { Divider, Spacer } from 'noya-designsystem';
import { Selectors, SetNumberMode } from 'noya-state';
import { getLayerRotation } from 'noya-state/src/selectors';
import { Fragment, memo, useCallback, useMemo, useState } from 'react';
import DimensionsInspector from '../components/inspector/DimensionsInspector';
import ColorInputFieldWithPicker from '../components/inspector/ColorInputFieldWithPicker';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from '../utils/withSeparatorElements';
import AlignmentInspector from './AlignmentInspector';
import ArtboardSizeList from './ArtboardSizeList';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import styled from 'styled-components';
import {
  Label,
  Select,
  RadioGroup,
  InputField,
  LabeledElementView,
} from 'noya-designsystem';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

function TextInspector() {
  const [state, setstate] = useState('Arial');
  const fontFamilies = ['Arial', 'Helvetica', 'Verdana', 'Trebuchet MS'];

  const id = '1';
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Character</Label.Label>;
        case hexInputId:
          return <Label.Label>Line</Label.Label>;
        case opacityInputId:
          return <Label.Label>Paragraph</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, opacityInputId],
  );

  const renderLabelx = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Decoration</Label.Label>;
        case hexInputId:
          return <Label.Label>Transform</Label.Label>;
        case opacityInputId:
          return <Label.Label>Paragraph</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, opacityInputId],
  );

  const [states, setstates] = useState('Regular');
  const fontSize = ['Regular', 'Bold', 'Semi Bold'];
  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>TEXT</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>

        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row>
          <Select
            id="text-layer-style"
            value={state}
            options={fontFamilies}
            getTitle={(name) => name}
            onChange={(name) => setstate(name)}
          />
        </InspectorPrimitives.Row>

        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row>
          <Select
            id="text-layer-style"
            value={states}
            options={fontSize}
            getTitle={(name) => name}
            onChange={(name) => setstates(name)}
          />
          <Spacer.Horizontal size={8} />
          <InputField.Root id="opacity-input" size={50}>
            <InputField.NumberInput
              value={32}
              onSubmit={() => {}}
              onNudge={() => {}}
            />
            <InputField.Label>px</InputField.Label>
          </InputField.Root>
        </InspectorPrimitives.Row>

        <Spacer.Vertical size={8} />
        <Row id={'id'}>
          <LabeledElementView renderLabel={renderLabel}>
            <InputField.NumberInput
              id={colorInputId}
              value={32}
              onSubmit={() => {}}
              onNudge={() => {}}
            />
            <Spacer.Horizontal size={8} />
            <InputField.Root id={hexInputId} labelPosition="start">
              <InputField.NumberInput
                value={32}
                onSubmit={() => {}}
                onNudge={() => {}}
              />
              <InputField.Label>#</InputField.Label>
            </InputField.Root>
            <Spacer.Horizontal size={8} />
            <InputField.Root id={opacityInputId} size={50}>
              <InputField.NumberInput
                value={32}
                onSubmit={() => {}}
                onNudge={() => {}}
              />
              <InputField.Label>%</InputField.Label>
            </InputField.Root>
            <ColorInputFieldWithPicker
              id={colorInputId}
              value={{ _class: 'color', red: 1, blue: 1, green: 1, alpha: 1 }}
              onChange={() => {}}
            />
          </LabeledElementView>
        </Row>
      </InspectorPrimitives.Section>
      <Spacer.Vertical size={10} />

      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Alignment</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row>
          <LabeledElementView renderLabel={() => 'Auto Height'}>
            <RadioGroup.Root
              id={'borderPositionId'}
              value={'horizontal'}
              onValueChange={() => {}}
            >
              <RadioGroup.Item value="horizontal" tooltip="Horizontal">
                <StretchHorizontallyIcon />
              </RadioGroup.Item>
              <RadioGroup.Item value="Vertical" tooltip="Vertical">
                <StretchVerticallyIcon />
              </RadioGroup.Item>
              <RadioGroup.Item value="outside" tooltip="Outside">
                <SquareIcon />
              </RadioGroup.Item>
            </RadioGroup.Root>
          </LabeledElementView>
        </InspectorPrimitives.Row>

        <Spacer.Vertical size={8} />
        <InspectorPrimitives.Row>
          <RadioGroup.Root
            id={'borderPositionId'}
            value={'horizontal'}
            onValueChange={() => {}}
          >
            <RadioGroup.Item value="horizontal" tooltip="Horizontal">
              <TextAlignLeftIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="vertical" tooltip="Vertical">
              <TextAlignCenterIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="outside" tooltip="Outside">
              <TextAlignRightIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="justify" tooltip="Jutside">
              <TextAlignJustifyIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </InspectorPrimitives.Row>

        <Spacer.Vertical size={8} />
        <InspectorPrimitives.Row>
          <RadioGroup.Root
            id={'borderPositionId'}
            value={'horizontal'}
            onValueChange={() => {}}
          >
            <RadioGroup.Item value="horizontal" tooltip="Horizontal">
              <PinTopIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="vertical" tooltip="Vertical">
              <AlignCenterVerticallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="outside" tooltip="Outside">
              <PinBottomIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Text Options</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <Spacer.Vertical size={10} />
        <Row id={'id'}>
          <LabeledElementView renderLabel={renderLabelx}>
            <Select
              id={colorInputId}
              value={states}
              options={fontSize}
              getTitle={(name) => name}
              onChange={(name) => setstates(name)}
            />
            <Spacer.Horizontal size={8} />
            <RadioGroup.Root
              id={hexInputId}
              value={'horizontal'}
              onValueChange={() => {}}
            >
              <RadioGroup.Item value="horizontal" tooltip="Horizontal">
                <StretchHorizontallyIcon />
              </RadioGroup.Item>
              <RadioGroup.Item value="Vertical" tooltip="Vertical">
                <StretchVerticallyIcon />
              </RadioGroup.Item>
              <RadioGroup.Item value="outside" tooltip="Outside">
                <SquareIcon />
              </RadioGroup.Item>
            </RadioGroup.Root>
          </LabeledElementView>
        </Row>
      </InspectorPrimitives.Section>
    </>
  );
}

export default memo(function TextStyleInspector() {
  const [state, dispatch] = useApplicationState();

  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  );
  const handleSetRotation = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLayerRotation', value, mode);
    },
    [dispatch],
  );

  const elements = useMemo(() => {
    const dimensionsInspectorProps =
      selectedLayers.length === 1
        ? {
            ...selectedLayers[0].frame,
            rotation: getLayerRotation(selectedLayers[0]),
          }
        : {
            x: undefined,
            y: undefined,
            width: undefined,
            height: undefined,
            rotation: undefined,
          };

    const views = [
      <Fragment key="layout">
        <AlignmentInspector />
        <DimensionsInspector
          {...dimensionsInspectorProps}
          onSetRotation={handleSetRotation}
        />
        <Spacer.Vertical size={10} />
      </Fragment>,
      <TextInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [selectedLayers, handleSetRotation]);

  if (state.interactionState.type === 'insertArtboard') {
    return <ArtboardSizeList />;
  }

  if (selectedLayers.length === 0) return null;

  return <>{elements}</>;
});
