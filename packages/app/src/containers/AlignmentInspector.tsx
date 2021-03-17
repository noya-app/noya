import { memo } from 'react';
import styled from 'styled-components';
import {
  AlignLeftIcon,
  AlignCenterHorizontallyIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignCenterVerticallyIcon,
  AlignBottomIcon,
  SpaceEvenlyHorizontallyIcon,
  SpaceEvenlyVerticallyIcon,
} from '@radix-ui/react-icons';
import { useApplicationState } from '../contexts/ApplicationStateContext';

const AlignmentInspectorContainer = styled.div(({ theme }) => ({
  display: 'flex',
  height: '35px',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  // background: theme.colors.divider,
  color: 'rgb(139, 139, 139)',
}));

interface AlignmentInspectorProps {}

function AlignmentInspector(props: AlignmentInspectorProps) {
  const [, dispatch] = useApplicationState();
  return (
    <AlignmentInspectorContainer>
      <SpaceEvenlyHorizontallyIcon
        onClick={() => dispatch('distributeLayers', 'horizontal')}
      />
      <SpaceEvenlyVerticallyIcon
        onClick={() => dispatch('distributeLayers', 'vertical')}
      />
      <AlignLeftIcon onClick={() => dispatch('alignLayers', 'left')} />
      <AlignCenterHorizontallyIcon
        onClick={() => dispatch('alignLayers', 'centerHorizontal')}
      />
      <AlignRightIcon onClick={() => dispatch('alignLayers', 'right')} />
      <AlignTopIcon onClick={() => dispatch('alignLayers', 'top')} />
      <AlignCenterVerticallyIcon
        onClick={() => dispatch('alignLayers', 'centerVertical')}
      />
      <AlignBottomIcon onClick={() => dispatch('alignLayers', 'bottom')} />
    </AlignmentInspectorContainer>
  );
}

export default memo(AlignmentInspector);
