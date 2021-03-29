import { Divider, InputField, Spacer, Slider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { Fragment, memo, useCallback, useMemo, ReactNode } from 'react';
import styled from 'styled-components';
import ColorSelectRow from '../components/inspector/ColorInspector';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import ArrayController from '../components/inspector/ArrayController';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from '../utils/withSeparatorElements';
import getMultiValue from '../utils/getMultiValue';
import FillRow from '../components/inspector/FillRow';
import BorderRow from '../components/inspector/BorderRow';
import ShadowRow from '../components/inspector/ShadowRow';

// TODO: Maybe move stuff to different files?

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

const ColorPickerInspector = memo(function ColorPickerInspector() {
  const [state, dispatch] = useApplicationState();

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedColorSwatches),
  );

  const ids = state.selectedSwatchIds;
  const colors = useMemo(() => selectedSwatches.map((swatch) => swatch.value), [
    selectedSwatches,
  ]);

  return (
    <Container>
      <ColorSelectRow
        id={'color-swatch'}
        colors={colors}
        onChangeOpacity={useCallback(
          (value) => dispatch('setSwatchOpacity', ids, value),
          [dispatch, ids],
        )}
        onNudgeOpacity={useCallback(
          (value) => dispatch('setSwatchOpacity', ids, value, 'adjust'),
          [dispatch, ids],
        )}
        onChangeColor={useCallback(
          (value) => dispatch('setSwatchColor', ids, value),
          [dispatch, ids],
        )}
      />
    </Container>
  );
});

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
      <>
        <InspectorPrimitives.Section>
          <InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.Title>Opacity</InspectorPrimitives.Title>
          </InspectorPrimitives.SectionHeader>
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
      </>
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
      <Title>Name</Title>
      <Spacer.Vertical size={4} />
      <InputField.Root id={'colorName'}>
        <InputField.Input
          value={name || ''}
          placeholder={name === undefined ? 'Multiple' : ''}
          onChange={onNameChange}
        />
      </InputField.Root>
      <Spacer.Vertical size={10} />
    </InspectorPrimitives.Section>
  );
});

export default memo(function ComponentsInspectors() {
  const [, dispatch] = useApplicationState();

  const selectedSwatches = useShallowArray(
    useSelector(Selectors.getSelectedColorSwatches),
  );

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedLayerStyle),
  );

  const tab = useSelector(Selectors.getCurrentComponentsTab);

  const elements = useMemo(() => {
    const views = [
      tab === 'swatches' && (
        <Fragment key="layout">
          <NameInspector
            selected={selectedSwatches.map((v) => v.name)}
            onNameChange={(value) =>
              dispatch(
                'setSwatchName',
                selectedSwatches.map((v) => v.do_objectID),
                value,
              )
            }
          />
          <ColorPickerInspector />
          <Spacer.Vertical size={10} />
        </Fragment>
      ),
      tab === 'layerStyles' && (
        <Fragment key="layout">
          <Spacer.Vertical size={10} />
          <NameInspector
            selected={selectedStyles.map((v) => v.name)}
            onNameChange={(value) =>
              dispatch(
                'setLayerStyleName',
                selectedStyles.map((v) => v.do_objectID),
                value,
              )
            }
          />
          <StyleOpacityInspector />,
          <StyleFillInspector />,
          <StyleBorderInspector />,
          <StyleShadowInspector />,
          <Spacer.Vertical size={10} />
        </Fragment>
      ),
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [dispatch, tab, selectedStyles, selectedSwatches]);

  if (
    (tab === 'swatches' && selectedSwatches.length === 0) ||
    (tab === 'layerStyles' && selectedStyles.length === 0)
  ) {
    return null;
  }

  return <>{elements}</>;
});
