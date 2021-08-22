import { withSeparatorElements } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { memo } from 'react';
import FillInputFieldWithPicker, {
  ShaderFillProps,
} from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

const ShaderVariableRow = memo(function ShaderVariableRow({
  id,
  variable,
  onChangeValue,
}: {
  id: string;
  variable: Sketch.ShaderVariable;
  onChangeValue: (value: Sketch.ShaderVariable['value']) => void;
}) {
  if (typeof variable.value === 'number') {
    return null;
  }

  switch (variable.value._class) {
    case 'color':
      return (
        <InspectorPrimitives.Row>
          <InspectorPrimitives.Text>{variable.name}</InspectorPrimitives.Text>
          <FillInputFieldWithPicker
            id={id}
            colorProps={{
              color: variable.value,
              onChangeColor: onChangeValue,
            }}
          />
        </InspectorPrimitives.Row>
      );
  }
});

export default memo(function ShaderInspector({
  id,
  shader,
  onChangeShaderVariableValue,
}: ShaderFillProps & { id: string }) {
  return (
    <InspectorPrimitives.Section>
      {withSeparatorElements(
        shader.variables.map((variable, index) => {
          const id = `shader-variable-value-${index}`;

          return (
            <ShaderVariableRow
              id={id}
              variable={variable}
              onChangeValue={(value) =>
                onChangeShaderVariableValue(variable.name, value)
              }
            />
          );
        }),
        <InspectorPrimitives.VerticalSeparator />,
      )}
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Column>
        <textarea
          value={shader.shaderString}
          onChange={() => {}}
          style={{
            border: 'none',
            color: 'white',
            background: 'rgba(0,0,0,0.5)',
            height: 200,
          }}
        />
      </InspectorPrimitives.Column>
    </InspectorPrimitives.Section>
  );
});
