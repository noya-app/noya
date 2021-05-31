import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo } from 'react';
import CanvasGridItem from '../theme/CanvasGridItem';
import { RCKSymbolPreview } from '../theme/Symbol';
import styled from 'styled-components';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  layer: Sketch.SymbolMaster;
}

export default memo(function NameInspector({ layer }: Props) {
  return (
    <Row>
      <CanvasGridItem
        renderContent={(size) => <RCKSymbolPreview layer={layer} size={size} />}
      />
    </Row>
  );
});
