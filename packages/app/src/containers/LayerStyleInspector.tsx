import { Divider, InputField, Spacer, Slider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo, ReactNode } from 'react';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import ArrayController from '../components/inspector/ArrayController';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import useShallowArray from '../hooks/useShallowArray';
import getMultiValue from '../utils/getMultiValue';
import FillRow from '../components/inspector/FillRow';
import BorderRow from '../components/inspector/BorderRow';
import ShadowRow from '../components/inspector/ShadowRow';
import withSeparatorElements from '../utils/withSeparatorElements';

// TODO: Maybe move stuff to different files?

const StyleOpacityInspector = memo(function OpacityInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayerStyle = useShallowArray(
    useSelector(Selectors.getSelectedLayerStyle),
  );

  const contextSettings = useShallowArray(
    selectedLayerStyle.flatMap((style) =>
      style.value.contextSettings ? [style.value.contextSettings] : [],
    ),
  );

  const opacityValue = useMemo(
    () => getMultiValue(contextSettings.map((item) => item.opacity)),
    [contextSettings],
  );

  const handleSubmitOpacity = useCallback(
    (value: number) => {
      dispatch('setLayerOpacity', value / 100, 'replace');
    },
    [dispatch],
  );

  const handleNudgeOpacity = useCallback(
    (value: number) => {
      dispatch('setLayerOpacity', value / 100, 'adjust');
    },
    [dispatch],
  );

  return useMemo(() => {
    const value =
      opacityValue !== undefined ? Math.round(opacityValue * 100) : undefined;

    return (
      <InspectorPrimitives.Section>
        <InspectorPrimitives.Title>Opacity</InspectorPrimitives.Title>
        <Spacer.Vertical size={4} />
        <InspectorPrimitives.Row>
          <Slider
            id="opacity-slider"
            value={value ?? 0}
            onValueChange={handleSubmitOpacity}
            min={0}
            max={100}
          />
          <Spacer.Horizontal size={10} />
          <InputField.Root id="opacity-input" size={50}>
            <InputField.NumberInput
              value={value}
              placeholder={value === undefined ? 'multi' : undefined}
              onSubmit={handleSubmitOpacity}
              onNudge={handleNudgeOpacity}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
    );
  }, [opacityValue, handleSubmitOpacity, handleNudgeOpacity]);
});

const StyleFillInspector = memo(function FillInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayerStyle);
  const fills = useShallowArray(
    selectedLayers.map((style) => style.value.fills),
  );
  // TODO: Modify all fills
  const firstFill = useMemo(() => fills[0] || [], [fills]);

  return (
    <ArrayController<FileFormat.Fill>
      title="Fills"
      id="fills"
      key="fills"
      value={firstFill}
      onClickPlus={useCallback(() => dispatch('addNewLayerFill'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledLayerFills'), [
        dispatch,
      ])}
      onDeleteItem={useCallback((index) => dispatch('deleteLayerFill', index), [
        dispatch,
      ])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveLayerFill', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setLayerFillEnabled', index, checked),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: FileFormat.Fill;
          index: number;
          checkbox: ReactNode;
        }) => (
          <FillRow
            id={`fill-${index}`}
            color={item.color}
            prefix={checkbox}
            onChangeOpacity={(value) =>
              dispatch('setLayerFillOpacity', index, value)
            }
            onNudgeOpacity={(value) =>
              dispatch('setLayerFillOpacity', index, value, 'adjust')
            }
            onChangeColor={(value) =>
              dispatch('setLayerFillColor', index, value)
            }
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});
const StyleBorderInspector = memo(function BorderInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayerStyle);
  const borders = useShallowArray(
    selectedLayers.map((style) => style.value.borders),
  );
  // TODO: Modify all borders
  const firstBorder = useMemo(() => borders[0] || [], [borders]);

  return (
    <ArrayController<FileFormat.Border>
      title="Borders"
      id="borders"
      key="borders"
      value={firstBorder}
      onClickPlus={useCallback(() => dispatch('addNewLayerBorder'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledLayerBorders'), [
        dispatch,
      ])}
      onDeleteItem={useCallback(
        (index) => dispatch('deleteLayerBorder', index),
        [dispatch],
      )}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveLayerBorder', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setLayerBorderEnabled', index, checked),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: FileFormat.Border;
          index: number;
          checkbox: ReactNode;
        }) => (
          <BorderRow
            id={`border-${index}`}
            color={item.color}
            prefix={checkbox}
            width={item.thickness}
            position={item.position}
            onNudgeWidth={(value) =>
              dispatch('setLayerBorderWidth', index, value, 'adjust')
            }
            onChangeWidth={(value) =>
              dispatch('setLayerBorderWidth', index, value)
            }
            onChangeColor={(value) => {
              dispatch('setLayerBorderColor', index, value);
            }}
            onChangePosition={(value) => {
              dispatch('setLayerBorderPosition', index, value);
            }}
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});

const StyleShadowInspector = memo(function ShadowInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayerStyle);
  const shadows = useShallowArray(
    selectedLayers.map((style) => style.value.shadows),
  );
  // TODO: Modify all shadows
  const firstShadow = useMemo(() => shadows[0] || [], [shadows]);

  return (
    <ArrayController<FileFormat.Shadow>
      title="Shadows"
      id="shadows"
      key="shadows"
      value={firstShadow}
      onClickPlus={useCallback(() => dispatch('addNewLayerShadow'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledLayerShadows'), [
        dispatch,
      ])}
      onDeleteItem={useCallback(
        (index) => dispatch('deleteLayerShadow', index),
        [dispatch],
      )}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveLayerShadow', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setLayerShadowEnabled', index, checked),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: FileFormat.Shadow;
          index: number;
          checkbox: ReactNode;
        }) => (
          <ShadowRow
            id={`shadow-${index}`}
            color={item.color}
            x={item.offsetX}
            y={item.offsetY}
            blur={item.blurRadius}
            spread={item.spread}
            prefix={checkbox}
            onChangeColor={(value) =>
              dispatch('setLayerShadowColor', index, value)
            }
            onChangeX={(value) => dispatch('setShadowX', index, value)}
            onNudgeX={(value) => dispatch('setShadowX', index, value, 'adjust')}
            onChangeY={(value) => dispatch('setShadowY', index, value)}
            onNudgeY={(value) => dispatch('setShadowY', index, value, 'adjust')}
            onChangeBlur={(value) => dispatch('setShadowBlur', index, value)}
            onNudgeBlur={(value) =>
              dispatch('setShadowBlur', index, value, 'adjust')
            }
            onChangeSpread={(value) =>
              dispatch('setShadowSpread', index, value)
            }
            onNudgeSpread={(value) =>
              dispatch('setShadowSpread', index, value, 'adjust')
            }
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});

interface Props {
  selected: string[];
  onNameChange: (value: any) => void;
}

const NameInspector = memo(function NameInspector({
  selected,
  onNameChange,
}: Props) {
  const first = selected[0];
  const name =
    selected.length > 1 && !selected.every((v) => v === first)
      ? undefined
      : first;

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Name</InspectorPrimitives.Title>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <InputField.Root id={'colorName'}>
          <InputField.Input
            value={name || ''}
            placeholder={name === undefined ? 'Multiple' : ''}
            onChange={onNameChange}
          />
        </InputField.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});

export default memo(function LayerStyleInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedLayerStyle),
  );

  const elements = [
    <NameInspector
      selected={selectedStyles.map((v) => v.name)}
      onNameChange={(value) =>
        dispatch(
          'setLayerStyleName',
          selectedStyles.map((v) => v.do_objectID),
          value,
        )
      }
    />,
    <StyleOpacityInspector />,
    <StyleFillInspector />,
    <StyleBorderInspector />,
    <StyleShadowInspector />,
  ];

  if (selectedStyles.length === 0) return null;

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
