// Initialize global configurations
import 'react-native-gesture-handler';
import '@shopify/react-native-skia';
import '../utils/prepareGlobals';

// Lib imports
import React, { Suspense } from 'react';
import styled, { ThemeProvider } from 'styled-components/native';
import {
  StatusBar,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';

// Local imports
import { CanvasKitProvider, SketchFileDebugProvider } from 'noya-renderer';
import { loadSkiaCanvasKit } from 'noya-skia-canvaskit';
import { darkTheme, lightTheme } from '../constants';
import AppContent from './AppContent';

const App: React.FC<{}> = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const AppLoader = (
    <ContentContainer>
      <AppSpinner size="large" />
    </ContentContainer>
  );

  return (
    <SketchFileDebugProvider>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <Suspense fallback={AppLoader}>
          <CanvasKitProvider loadCanvasKit={loadSkiaCanvasKit}>
            <AppWrapper>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              />
              <AppContent />
            </AppWrapper>
          </CanvasKitProvider>
        </Suspense>
      </ThemeProvider>
    </SketchFileDebugProvider>
  );
};

export default App;

const AppWrapper = styled(SafeAreaView)((_props) => ({
  flex: 1,
}));

const ContentContainer = styled.View((p) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: p.theme.colors.sidebar.background,
}));

const AppSpinner = styled(ActivityIndicator)((p) => ({
  color: p.theme.colors.text,
}));
