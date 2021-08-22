import { Cross1Icon } from '@radix-ui/react-icons';
import {
  InputField,
  Label,
  LabeledElementView,
  Select,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { memo } from 'react';
import styled from 'styled-components';
import ArrayController from './ArrayController';
import FillInputFieldWithPicker, {
  ShaderFillProps,
} from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

type VariableType = 'Number' | 'Color';

const ShaderVariableRow = memo(function ShaderVariableRow({
  id,
  variable,
  onChangeValue,
  onChangeName,
  onClickDelete,
}: {
  id: string;
  variable: Sketch.ShaderVariable;
  onChangeName: (name: string) => void;
  onChangeValue: (value: Sketch.ShaderVariable['value']) => void;
  onClickDelete: () => void;
}) {
  const valueInputId = `${id}-value`;
  const nameInputId = `${id}-name`;
  const typeInputId = `${id}-type`;

  let editor;
  let variableType: VariableType;

  if (typeof variable.value === 'number') {
    variableType = 'Number';
    editor = (
      <InputField.Root size={50} id={valueInputId}>
        <InputField.NumberInput
          value={variable.value}
          onChange={onChangeValue}
        />
      </InputField.Root>
    );
  } else {
    switch (variable.value._class) {
      case 'color':
        variableType = 'Color';
        editor = (
          <FillInputFieldWithPicker
            id={valueInputId}
            colorProps={{
              color: variable.value,
              onChangeColor: onChangeValue,
            }}
          />
        );
        break;
    }
  }

  return (
    <InspectorPrimitives.Row>
      <LabeledElementView
        renderLabel={({ id }) => {
          switch (id) {
            case valueInputId:
              return <Label.Label>{variableType}</Label.Label>;
            case nameInputId:
              return <Label.Label>Name</Label.Label>;
            case typeInputId:
              return <Label.Label>Type</Label.Label>;
            default:
              return null;
          }
        }}
      >
        {editor}
        <InspectorPrimitives.HorizontalSeparator />
        <Select
          id={typeInputId}
          value={variableType}
          options={['Number', 'Color']}
          onChange={(type) => {
            switch (type) {
              case 'Number':
                onChangeValue(0);
                break;
              case 'Color':
                onChangeValue(
                  SketchModel.color({ red: 0, green: 0, blue: 0, alpha: 1 }),
                );
                break;
            }
          }}
          flex="0 0 70px"
        />
        <InspectorPrimitives.HorizontalSeparator />
        <InputField.Root id={nameInputId}>
          <InputField.Input onSubmit={onChangeName} value={variable.name} />
        </InputField.Root>
        <InspectorPrimitives.HorizontalSeparator />
        <Cross1Icon onClick={onClickDelete} />
      </LabeledElementView>
    </InspectorPrimitives.Row>
  );
});

const VerticalDivider = styled.div(({ theme }) => ({
  alignSelf: 'stretch',
  background: theme.colors.divider,
  width: '1px',
  margin: '10px 0',
}));

export default memo(function ShaderInspector({
  id,
  shader,
  onChangeShaderString,
  onAddShaderVariable,
  onDeleteShaderVariable,
  onChangeShaderVariableValue,
  onChangeShaderVariableName,
}: ShaderFillProps & { id: string }) {
  return (
    <InspectorPrimitives.Row alignItems="flex-start">
      <div
        style={{
          width: 260,
          display: 'flex',
        }}
      >
        <InspectorPrimitives.Column>
          <ArrayController<Sketch.ShaderVariable>
            id="shader-variables"
            title="Variables"
            items={shader.variables}
            sortable
            renderItem={({ item, index }) => (
              <ShaderVariableRow
                id={`${id}-${index}`}
                variable={item}
                onChangeValue={(value) =>
                  onChangeShaderVariableValue(item.name, value)
                }
                onClickDelete={() => onDeleteShaderVariable(item.name)}
                onChangeName={(name) =>
                  onChangeShaderVariableName(item.name, name)
                }
              />
            )}
            onClickPlus={onAddShaderVariable}
          />
        </InspectorPrimitives.Column>
      </div>
      <VerticalDivider />
      <InspectorPrimitives.Column>
        <textarea
          value={shader.shaderString}
          onChange={(event) => {
            onChangeShaderString(event.target.value);
          }}
          style={{
            padding: '4px',
            margin: '10px',
            border: 'none',
            color: 'white',
            background: 'rgba(0,0,0,0.5)',
            height: 300,
            borderRadius: '4px',
          }}
        />
      </InspectorPrimitives.Column>
    </InspectorPrimitives.Row>
  );
});
