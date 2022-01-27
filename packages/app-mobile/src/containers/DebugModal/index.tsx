import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/native';
import { Modal, ScrollView } from 'react-native';

import { SketchFileDebugContext } from 'noya-renderer';
import Button from '../../components/Button';
import ModalSection from './ModalSection';

interface DebugModalProps {
  showModal: boolean;
  setShowModal: (showModa: boolean) => void;
}

const DebugModal: React.FC<DebugModalProps> = (props) => {
  const debugCtx = useContext(SketchFileDebugContext);
  const { showModal, setShowModal } = props;
  const [obj, setObj] = useState<any>({});

  const onCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    setObj(debugCtx.obj);
  }, [debugCtx.obj]);

  return (
    <Modal visible={showModal}>
      <ModalContent>
        <ModalHeader>
          <Button label="Close Debug Modal" onPress={onCloseModal} />
        </ModalHeader>
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
          <CodeView>
            {Object.keys(obj).map((key, index) => (
              <ModalSection
                key={`${key}-${index}`}
                name={key}
                value={obj[key]}
              />
            ))}
          </CodeView>
        </ScrollView>
      </ModalContent>
    </Modal>
  );
};

export default DebugModal;

const ModalContent = styled.View((p) => ({
  flex: 1,
  paddingTop: 30,
  backgroundColor: p.theme.colors.sidebar.background,
}));

const ModalHeader = styled.View((p) => ({
  width: '100%',
  flexDirection: 'row',
  padding: p.theme.sizes.spacing.medium,
  backgroundColor: p.theme.colors.sidebar.background,
}));

const CodeView = styled.View((p) => ({
  padding: 20,
}));
