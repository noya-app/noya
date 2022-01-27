import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, TouchableOpacity } from 'react-native';

interface ModalSectionProps {
  name: string;
  value: any;
}

const ModalSection: React.FC<ModalSectionProps> = (props) => {
  const { name, value } = props;
  const isNotObj = typeof value !== 'object';

  const [expanded, setExpanded] = useState(isNotObj);

  return (
    <View style={[isNotObj && { flexDirection: 'row' }]}>
      <View style={[{ flexDirection: 'row' }, isNotObj && { width: 200 }]}>
        {isNotObj ? (
          <CodeText>{name}</CodeText>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setExpanded(!expanded);
            }}
          >
            <CodeText>
              {expanded ? '[-]' : '[+]'} {name}
            </CodeText>
          </TouchableOpacity>
        )}
      </View>
      <View style={[isNotObj && { flex: 1 }]}>
        {expanded && <CodeText>{JSON.stringify(value, null, 2)}</CodeText>}
      </View>
    </View>
  );
};

export default ModalSection;

const CodeText = styled.Text((p) => ({
  fontSize: 16,
}));
