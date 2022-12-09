import { GlobalStyles } from 'noya-colors-editor';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { PipelineProvider } from 'noya-pipeline';
import * as React from 'react';
import { Suspense } from 'react';
import { Flow } from './components/Flow';

function Contents() {
  return <Flow />;
}

export default function NoyaPipelineEditor(): JSX.Element {
  return (
    <Suspense fallback="Loading">
      <PipelineProvider>
        <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
          <GlobalStyles />
          <Contents />
        </DesignSystemConfigurationProvider>
      </PipelineProvider>
    </Suspense>
  );
}
