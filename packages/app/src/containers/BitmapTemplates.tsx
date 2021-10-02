// import { useApplicationState } from 'noya-app-state-context';
import { GridView } from 'noya-designsystem';
import { memo } from 'react';
import styled from 'styled-components';

import template1 from '../assets/bitmapTemplate1.png';

const TemplateItem = styled.div({
  flex: '1 1 0%',
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  justifyContent: 'center',
});

export const BitmapTemplates = memo(function BitmapTemplates() {
  // const [state, dispatch] = useApplicationState();

  return (
    <GridView.Root variant="small">
      <GridView.SectionHeader title={'Templates'} />
      <GridView.Section>
        <GridView.Item
          id="template1"
          title="Test"
          selected={false}
          layout="fill"
        >
          <TemplateItem>
            <img src={template1} width={'auto'} height={'100%'} alt="" />
          </TemplateItem>
        </GridView.Item>
      </GridView.Section>
    </GridView.Root>
  );
});
