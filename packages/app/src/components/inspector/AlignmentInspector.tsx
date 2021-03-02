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
      <SpaceEvenlyHorizontallyIcon />
      <SpaceEvenlyVerticallyIcon />
      <AlignLeftIcon onClick={() => dispatch('alignLeft')} />
      <AlignCenterHorizontallyIcon />
      <AlignRightIcon onClick={() => dispatch('alignRight')} />
      <AlignTopIcon onClick={() => dispatch('alignTop')} />
      <AlignCenterVerticallyIcon />
      <AlignBottomIcon onClick={() => dispatch('alignBottom')} />
    </AlignmentInspectorContainer>
  );
}

export default memo(AlignmentInspector);
