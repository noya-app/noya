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
import { useApplicationState } from '../../contexts/ApplicationStateContext';

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
        onClick={() => dispatch('distribute', 'horizontal')}
      />
      <SpaceEvenlyVerticallyIcon
        onClick={() => dispatch('distribute', 'vertical')}
      />
      <AlignLeftIcon onClick={() => dispatch('align', 'left')} />
      <AlignCenterHorizontallyIcon
        onClick={() => dispatch('align', 'centerHorizontal')}
      />
      <AlignRightIcon onClick={() => dispatch('align', 'right')} />
      <AlignTopIcon onClick={() => dispatch('align', 'top')} />
      <AlignCenterVerticallyIcon
        onClick={() => dispatch('align', 'centerVertical')}
      />
      <AlignBottomIcon onClick={() => dispatch('align', 'bottom')} />
    </AlignmentInspectorContainer>
  );
}

export default memo(AlignmentInspector);
