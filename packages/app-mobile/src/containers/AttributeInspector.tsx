import React, { memo } from 'react';
import styled from 'styled-components';
import { View, Text, TextInput } from 'react-native';

import { InputField } from 'noya-designsystem';
import { useState } from 'react';

interface AttributeInspectorProps {}

const AttributeInspector: React.FC<AttributeInspectorProps> = (props) => {
  const [value, setValue] = useState(10);

  return (
    <>
      <Text style={{ color: '#fff' }}>Attribute Inspector</Text>
      <View
        style={{
          backgroundColor: 'rgba(255, 0, 255, 0.1)',
          padding: 10,
          height: 100,
        }}
      >
        <InputField.Root>
          <InputField.NumberInput
            value={value}
            placeholder="number input test1"
            onSubmit={setValue}
          />
        </InputField.Root>
        <TextInput
          style={{ flex: 1, backgroundColor: '#fff', color: '#000' }}
        />
      </View>
    </>
  );
};

export default AttributeInspector;
