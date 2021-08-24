import {
  IconButton,
  InputField,
  Label,
  LabeledElementView,
  Select,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { upperFirst } from 'noya-utils';
import { memo, useCallback } from 'react';
import FillInputFieldWithPicker from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

const SHADER_VARIABLE_TYPES: Sketch.ShaderVariable['value']['type'][] = [
  'integer',
  'float',
  'color',
];

interface ValueProps {
  id: string;
  value: Sketch.ShaderVariable['value'];
  onChange: (value: Sketch.ShaderVariable['value']) => void;
  onNudge: (amount: number) => void;
  flex?: string;
}

export const ShaderVariableValueInput = memo(function ShaderVariableValueInput({
  id,
  value,
  onChange,
  onNudge,
  flex,
}: ValueProps) {
  switch (value.type) {
    case 'integer':
    case 'float': {
      return (
        <InputField.Root id={id} flex={flex}>
          <InputField.NumberInput
            value={value.data}
            onSubmit={(data) => onChange({ type: value.type, data })}
            onNudge={onNudge}
          />
        </InputField.Root>
      );
    }
    case 'color': {
      return (
        <FillInputFieldWithPicker
          id={id}
          flex={flex}
          colorProps={{
            color: value.data,
            onChangeColor: (data) => onChange({ type: value.type, data }),
          }}
        />
      );
    }
  }
});

interface Props {
  id: string;
  variable: Sketch.ShaderVariable;
  onChangeName: (name: string) => void;
  onChangeValue: (value: Sketch.ShaderVariable['value']) => void;
  onNudge: (value: number) => void;
  onClickDelete: () => void;
}

export const ShaderVariableRow = memo(function ShaderVariableRow({
  id,
  variable,
  onChangeValue,
  onNudge,
  onChangeName,
  onClickDelete,
}: Props) {
  const valueInputId = `${id}-value`;
  const nameInputId = `${id}-name`;
  const typeInputId = `${id}-type`;

  const renderLabel = useCallback(
    ({ id }: { id: string }) => {
      switch (id) {
        case valueInputId:
          return <Label.Label>{upperFirst(variable.value.type)}</Label.Label>;
        case nameInputId:
          return <Label.Label>Name</Label.Label>;
        case typeInputId:
          return <Label.Label>Type</Label.Label>;
        default:
          return null;
      }
    },
    [nameInputId, typeInputId, valueInputId, variable.value.type],
  );

  const handleChangeOption = useCallback(
    (type: Sketch.ShaderVariable['value']['type']) => {
      switch (type) {
        case 'integer':
        case 'float':
          onChangeValue({ type, data: 0 });
          break;
        case 'color':
          onChangeValue({ type, data: SketchModel.BLACK });
          break;
      }
    },
    [onChangeValue],
  );

  return (
    <InspectorPrimitives.Row>
      <LabeledElementView renderLabel={renderLabel}>
        <ShaderVariableValueInput
          id={valueInputId}
          flex="0 0 50px"
          onChange={onChangeValue}
          onNudge={onNudge}
          value={variable.value}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <Select
          id={typeInputId}
          flex="0 0 70px"
          value={variable.value.type}
          getTitle={upperFirst}
          options={SHADER_VARIABLE_TYPES}
          onChange={handleChangeOption}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <InputField.Root id={nameInputId}>
          <InputField.Input
            onSubmit={useCallback(
              (name, reset) => {
                name = name.replace(/[^_a-zA-Z0-9]/, '');

                if (!name.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)) {
                  reset();
                  return;
                }

                onChangeName(name);
              },
              [onChangeName],
            )}
            value={variable.name}
          />
        </InputField.Root>
        <InspectorPrimitives.HorizontalSeparator />
        <IconButton
          id={`${id}-delete`}
          iconName="Cross2Icon"
          onClick={onClickDelete}
        />
      </LabeledElementView>
    </InspectorPrimitives.Row>
  );
});
